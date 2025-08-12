import SpotifyWebApi from "spotify-web-api-js";

/**
 * Authentication helpers
 * Following the PKCE auth flow: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
 */

const generateRandomString = (length: number) => {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

const sha256 = async (plain: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
};

const base64encode = (input: ArrayBuffer) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

export interface SpotifyTokenResp {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
}

export type CurrentToken = {
  readonly accessToken: string | null;
  readonly refreshToken: string | null;
  readonly expiresIn: string | null;
  readonly expiresAt: string | null;
  save: (response: SpotifyTokenResp) => void;
};

// Data structure to manage Spotify client instances
export interface SpotifyClientConfig {
  clientID: string;
  redirectURL: string;
  scope?: string;
}

export interface SpotifyClientInstance {
  client: SpotifyWebApi.SpotifyWebApiJs;
  config: SpotifyClientConfig;
  isAuthenticated: boolean;
  lastUsed: Date;
}

// Global client cache to avoid creating multiple instances
const clientCache = new Map<string, SpotifyClientInstance>();

/**
 * Get or create a Spotify client instance
 * @param config - Spotify client configuration
 * @param accessToken - Access token for immediate authentication
 * @returns Promise<SpotifyClientInstance>
 */
export async function getOrCreateSpotifyClient(
  config: SpotifyClientConfig,
  accessToken: string
): Promise<SpotifyClientInstance> {
  const cacheKey = `${config.clientID}-${config.redirectURL}`;

  // Check if we have a cached instance
  const cachedInstance = clientCache.get(cacheKey);
  if (cachedInstance) {
    // Update last used timestamp
    cachedInstance.lastUsed = new Date();

    // If we have a new access token, update the client
    if (accessToken && !cachedInstance.isAuthenticated) {
      try {
        // Update the token directly
        cachedInstance.client.setAccessToken(accessToken);
        cachedInstance.isAuthenticated = true;
      } catch (error: any) {
        console.error("Failed to authenticate cached client:", error);
        // Remove failed instance from cache
        clientCache.delete(cacheKey);
      }
    }

    return cachedInstance;
  }

  // Create new client instance
  try {
    const client = new SpotifyWebApi();
    client.setAccessToken(accessToken);

    const instance: SpotifyClientInstance = {
      client,
      config,
      isAuthenticated: !!accessToken,
      lastUsed: new Date(),
    };

    // Cache the new instance
    clientCache.set(cacheKey, instance);

    return instance;
  } catch (error) {
    console.error("Failed to create Spotify client:", error);
    throw new Error(`Failed to create Spotify client: ${error}`);
  }
}

/**
 * Authenticate a Spotify client using authorization code (PKCE flow)
 * @param clientInstance - Spotify client instance
 * @param authCode - Authorization code from Spotify redirect
 * @returns Promise<boolean> - True if authentication successful
 */
export async function authenticateSpotifyClient(
  clientInstance: SpotifyClientInstance,
  authCode: string
): Promise<boolean> {
  try {
    // Use the existing PKCE token exchange function
    const token = await getToken(
      authCode,
      clientInstance.config.clientID,
      clientInstance.config.redirectURL
    );

    // Update the client token
    clientInstance.client.setAccessToken(token.access_token);
    clientInstance.isAuthenticated = true;
    clientInstance.lastUsed = new Date();
    return true;
  } catch (error: any) {
    console.error("Failed to authenticate Spotify client:", error);
    return false;
  }
}

/**
 * Refresh authentication for a Spotify client (PKCE flow)
 * @param clientInstance - Spotify client instance
 * @param refreshTokenValue - Refresh token
 * @returns Promise<boolean> - True if refresh successful
 */
export async function refreshSpotifyClient(
  clientInstance: SpotifyClientInstance,
  refreshTokenValue: string
): Promise<boolean> {
  try {
    // Use the existing refresh token function
    const token = await refreshToken(clientInstance.config.clientID, {
      accessToken: null,
      refreshToken: refreshTokenValue,
      expiresIn: null,
      expiresAt: null,
      save: () => {}, // We'll handle the save manually
    });

    // Update the client token
    clientInstance.client.setAccessToken(token.access_token);
    clientInstance.isAuthenticated = true;
    clientInstance.lastUsed = new Date();
    return true;
  } catch (error: any) {
    console.error("Failed to refresh Spotify client:", error);
    return false;
  }
}

/**
 * Clean up expired client instances (older than 1 hour)
 */
export function cleanupExpiredClients(): void {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  for (const [key, instance] of clientCache.entries()) {
    if (instance.lastUsed < oneHourAgo) {
      clientCache.delete(key);
    }
  }
}

/**
 * Get all cached client instances (for debugging)
 */
export function getCachedClients(): Map<string, SpotifyClientInstance> {
  return new Map(clientCache);
}

const getToken = async (
  code: string,
  spotifyClientId: string,
  redirectUri: string
) => {
  // stored in the previous step
  const codeVerifier = localStorage.getItem("code_verifier");

  if (!codeVerifier) {
    throw new Error("Missing code verifier");
  }

  const url = "https://accounts.spotify.com/api/token";
  const payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: spotifyClientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  };

  const reponse = await fetch(url, payload);

  if (reponse.status !== 200) {
    const body = await reponse.json();
    throw new Error(body.error.message);
  }

  const body: SpotifyTokenResp = await reponse.json();
  return body;
};

export const checkForAccessToken = async (
  spotifyClientId: string,
  redirectUri: string,
  currentToken: CurrentToken
) => {
  // on page load, check if auth code is set from Spotify redirect
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");

  // if there is a code, do a token exchange
  if (code) {
    const token = await getToken(code, spotifyClientId, redirectUri);
    currentToken.save(token);

    // remove code from URL
    const url = new URL(window.location.href);
    url.searchParams.delete("code");

    const updatedUrl = url.search ? url.href : url.href.replace("?", "");
    window.history.replaceState({}, document.title, updatedUrl);
  }

  // if access token is found and it is not expired, we are all logged in
  if (
    currentToken.accessToken &&
    currentToken.expiresAt &&
    new Date(currentToken.expiresAt).getTime() > new Date().getTime()
  ) {
    // all logged in :)
    console.log("Logged in");
  } else if (
    currentToken.accessToken &&
    currentToken.expiresAt &&
    new Date(currentToken.expiresAt).getTime() < new Date().getTime() &&
    currentToken.refreshToken
  ) {
    // use refresh token to reauth
    const token = await refreshToken(spotifyClientId, currentToken);
    currentToken.save(token);
  }
};

export const refreshToken = async (
  spotifyClientId: string,
  currentToken: CurrentToken
) => {
  if (!currentToken.refreshToken) {
    throw new Error("No refresh token provided");
  }

  const url = "https://accounts.spotify.com/api/token";
  const payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: spotifyClientId,
      grant_type: "refresh_token",
      refresh_token: currentToken.refreshToken,
    }),
  };

  const response = await fetch(url, payload);

  if (response.status !== 200) {
    const body = await response.json();
    throw new Error(body.error.message);
  }

  const body: SpotifyTokenResp = await response.json();
  return body;
};

// TODO: Add error handling here too if user decides to cancel instead of authorize :)
export const auth = async (
  spotifyClientId: string,
  redirectUri: string,
  scope: string
) => {
  const codeVerifier = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

  window.localStorage.setItem("code_verifier", codeVerifier);

  const params = {
    response_type: "code",
    client_id: spotifyClientId,
    scope,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
  };
  const authUrl = new URL("https://accounts.spotify.com/authorize");
  authUrl.search = new URLSearchParams(params).toString();

  // redirect to spotify auth page
  window.location.href = authUrl.toString();
};

/**
 * API wrappers
 */

// https://developer.spotify.com/documentation/web-api/reference/start-a-users-playback
export async function startOrResumePlayback(
  accessToken: string,
  contextUri?: string,
  deviceId?: string
) {
  const spotifyClient = (
    await getOrCreateSpotifyClient(
      {
        clientID: process.env.REACT_APP_SPOTIFY_CLIENT_ID || "",
        redirectURL: "http://127.0.0.1:3000/fun-stuff",
      },
      accessToken
    )
  ).client;

  const options = {
    ...(contextUri ? { context_uri: contextUri } : {}),
    ...(deviceId ? { device_id: deviceId } : {}),
  };

  try {
    await spotifyClient.play(options);
  } catch (err: any) {
    const errorObject = JSON.parse(err.response);
    console.error(errorObject);
    throw new Error(
      `Issue with startOrResumePlayback - ${errorObject.error.message}`
    );
  }

  return;
}

// https://developer.spotify.com/documentation/web-api/reference/pause-a-users-playback
export async function pausePlayback(accessToken: string) {
  // TODO: Add other params (device_id)
  const spotifyClient = (
    await getOrCreateSpotifyClient(
      {
        clientID: process.env.REACT_APP_SPOTIFY_CLIENT_ID || "",
        redirectURL: "http://127.0.0.1:3000/fun-stuff",
      },
      accessToken
    )
  ).client;

  try {
    await spotifyClient.pause();
  } catch (err: any) {
    const errorObject = JSON.parse(err.response);
    console.error(errorObject);
    throw new Error(`Issue with pausePlayback - ${errorObject.error.message}`);
  }

  return;
}

// https://developer.spotify.com/documentation/web-api/reference/skip-users-playback-to-next-track
export async function skipToNext(accessToken: string) {
  // TODO: Add other params (device_id)
  const spotifyClient = (
    await getOrCreateSpotifyClient(
      {
        clientID: process.env.REACT_APP_SPOTIFY_CLIENT_ID || "",
        redirectURL: "http://127.0.0.1:3000/fun-stuff",
      },
      accessToken
    )
  ).client;

  try {
    await spotifyClient.skipToNext();
  } catch (err: any) {
    const errorObject = JSON.parse(err.response);
    console.error(errorObject);
    throw new Error(`Issue with skipToNext  - ${errorObject.error.message}`);
  }

  return;
}

// https://developer.spotify.com/documentation/web-api/reference/get-the-users-currently-playing-track
export async function getCurrentlyPlayingTrack(accessToken: string) {
  var spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(accessToken);

  try {
    const body = await spotifyApi.getMyCurrentPlayingTrack();
    return body as SpotifyApi.CurrentlyPlayingResponse &
      Partial<{
        item: { album: { release_date: string } };
      }>;
  } catch (err: any) {
    const errorObject = JSON.parse(err.response);
    console.error(errorObject);
    throw new Error(
      `Issue with getCurrentlyPlayingTrack  - ${errorObject.error.message}`
    );
  }
}

// https://developer.spotify.com/documentation/web-api/reference/transfer-a-users-playback
export async function transferPlayback(accessToken: string, deviceId: string) {
  var spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(accessToken);

  try {
    await spotifyApi.transferMyPlayback([deviceId]);
  } catch (err: any) {
    const errorObject = JSON.parse(err.response);
    console.error(errorObject);
    throw new Error(
      `Issue with getCurrentlyPlayingTrack  - ${errorObject.error.message}`
    );
  }

  return;
}

// https://developer.spotify.com/documentation/web-api/reference/toggle-shuffle-for-users-playback
export async function togglePlaybackShuffle(
  accessToken: string,
  state: boolean,
  device_id?: string
) {
  var spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(accessToken);

  const options = device_id ? { device_id } : {};

  try {
    await spotifyApi.setShuffle(state, options);
  } catch (err: any) {
    const errorObject = JSON.parse(err.response);
    console.error(errorObject);
    throw new Error(
      `Issue with getCurrentlyPlayingTrack  - ${errorObject.error.message}`
    );
  }

  return;
}
