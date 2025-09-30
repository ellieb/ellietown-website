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

export interface CurrentToken {
  readonly accessToken: string | null;
  readonly refreshToken: string | null;
  readonly expiresIn: string | null;
  readonly expiresAt: string | null;
  save: (response: SpotifyTokenResp) => void;
}

// Data structure to manage Spotify client instances
export interface SpotifyClientConfig {
  readonly clientID: string;
  readonly redirectURL: string;
  readonly scope: string;
}

export interface SpotifyClientInstance {
  client: SpotifyWebApi.SpotifyWebApiJs;
  config: SpotifyClientConfig;
  isAuthenticated: boolean;
  lastUsed: Date;
}

// Global client cache to avoid creating multiple instances
const clientCache = new Map<string, SpotifyClientInstance>();

// Structure that manages access token for the PKCE authorization flow
export class PKCETokenStorage implements CurrentToken {
  private _accessToken: string | null = null;
  private _refreshToken: string | null = null;
  private _expiresIn: string | null = null;
  private _expiresAt: string | null = null;

  get accessToken(): string | null {
    return this._accessToken || localStorage.getItem("access_token");
  }
  get refreshToken(): string | null {
    return this._refreshToken || localStorage.getItem("refresh_token");
  }
  get expiresIn(): string | null {
    return this._expiresIn || localStorage.getItem("expires_in");
  }
  get expiresAt(): string | null {
    return this._expiresAt || localStorage.getItem("expires_at");
  }

  save = (response: SpotifyTokenResp): void => {
    const { access_token, refresh_token, expires_in } = response;
    const expiresAt = new Date(new Date().getTime() + expires_in * 1000);

    this._accessToken = response.access_token;
    this._refreshToken = response.refresh_token;
    this._expiresIn = response.expires_in.toString();
    this._expiresAt = expiresAt.toString();

    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    localStorage.setItem("expires_in", expires_in.toString());
    localStorage.setItem("expires_at", expiresAt.toString());
  };
}

export const SPOTIFY_CONFIG: SpotifyClientConfig = {
  clientID: process.env.REACT_APP_SPOTIFY_CLIENT_ID || "",
  redirectURL:
    process.env.REACT_APP_SPOTIFY_REDIRECT_URL || window.location.href,
  scope:
    "user-read-playback-state user-modify-playback-state user-read-currently-playing streaming user-read-email user-read-private",
};

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

export async function getAuthenticatedClient(): Promise<SpotifyClientInstance | null> {
  const tokenStorage = new PKCETokenStorage();
  try {
    // Check if we have a valid token
    if (tokenStorage.accessToken && tokenStorage.expiresAt) {
      const expiresAt = new Date(tokenStorage.expiresAt);
      if (expiresAt.getTime() > new Date().getTime()) {
        // Token is still valid
        const clientInstance = await getOrCreateSpotifyClient(
          SPOTIFY_CONFIG,
          tokenStorage.accessToken
        );
        return clientInstance;
      } else if (tokenStorage.refreshToken) {
        // Token expired, try to refresh
        console.log("Token expired, attempting refresh...");
        // You would implement token refresh here
        return null;
      }
    }

    console.log("No valid authentication found");
    return null;
  } catch (error) {
    console.error("Error getting authenticated client:", error);
    return null;
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

export const checkForAccessToken = async () => {
  // on page load, check if auth code is set from Spotify redirect
  const currentToken = new PKCETokenStorage();
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");

  // if there is a code, do a token exchange
  if (code) {
    const token = await getToken(
      code,
      SPOTIFY_CONFIG.clientID,
      SPOTIFY_CONFIG.redirectURL
    );
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
    !!currentToken.refreshToken
  ) {
    // use refresh token to reauth
    const token = await refreshToken(SPOTIFY_CONFIG.clientID, currentToken);
    currentToken.save(token);
  }
  return currentToken.accessToken;
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
export const auth = async () => {
  const codeVerifier = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

  window.localStorage.setItem("code_verifier", codeVerifier);

  const params = {
    response_type: "code",
    client_id: SPOTIFY_CONFIG.clientID,
    scope: SPOTIFY_CONFIG.scope,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    redirect_uri: SPOTIFY_CONFIG.redirectURL,
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
  contextUri?: string,
  deviceId?: string
) {
  const options = {
    ...(contextUri ? { context_uri: contextUri } : {}),
    ...(deviceId ? { device_id: deviceId } : {}),
  };

  try {
    const clientInstance = await getAuthenticatedClient();

    if (!clientInstance) {
      throw new Error("No authenticated client available");
    }

    await clientInstance.client.play(options);
  } catch (err: any) {
    const errorObject = JSON.parse(err.response);
    console.error(errorObject);
    throw new Error(
      `Issue with startOrResumePlayback - ${errorObject.error.message}`
    );
  }

  return;
}

// https://developer.spotify.com/documentation/web-api/reference/search
export async function searchByISRC(isrc: string) {
  const query = `isrc:${isrc}`;
  const options = { type: "track", market: "CA", limit: 10 };

  try {
    const clientInstance = await getAuthenticatedClient();

    if (!clientInstance) {
      throw new Error("No authenticated client available");
    }

    const results = await clientInstance.client.searchTracks(query, options);

    return results.tracks.items;
  } catch (err: any) {
    const errorObject = JSON.parse(err.response);
    console.error(errorObject);
    throw new Error(`Issue with searchByISRC  - ${errorObject.error.message}`);
  }
}

type TrackWithAlbumInfo = SpotifyApi.TrackObjectFull & {
  album: {
    release_date: string;
    images: { url: string; height: number; width: number }[];
  };
};

function findEarliestVersion(tracks: TrackWithAlbumInfo[]) {
  let earliest = null;

  for (const track of tracks) {
    const releaseDate = track.album.release_date;

    if (!earliest || releaseDate < earliest.album.release_date) {
      earliest = track;
    }
  }

  return earliest;
}

// https://developer.spotify.com/documentation/web-api/reference/get-the-users-currently-playing-track
export async function getCurrentlyPlayingTrack(market: string = "CA") {
  try {
    const clientInstance = await getAuthenticatedClient();

    if (!clientInstance) {
      throw new Error("No authenticated client available");
    }

    const body = await clientInstance.client.getMyCurrentPlayingTrack({
      market,
    });

    if (body?.item && "id" in body.item) {
      const isrc = body.item.external_ids.isrc;

      if (!isrc) {
        throw new Error("No ISRC found for this track.");
      }

      const versions = (await searchByISRC(isrc)) as TrackWithAlbumInfo[];

      if (versions.length === 0) {
        throw new Error("No other versions found for this ISRC.");
      }

      return findEarliestVersion(versions as TrackWithAlbumInfo[]);
    }
  } catch (err: any) {
    const errorObject = JSON.parse(err.response);
    console.error(errorObject);
    throw new Error(
      `Issue with getCurrentlyPlayingTrack  - ${errorObject.error.message}`
    );
  }
}

// https://developer.spotify.com/documentation/web-api/reference/transfer-a-users-playback
export async function transferPlayback(deviceId: string) {
  try {
    const clientInstance = await getAuthenticatedClient();

    if (!clientInstance) {
      throw new Error("No authenticated client available");
    }

    await clientInstance.client.transferMyPlayback([deviceId]);
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
  state: boolean,
  device_id?: string
) {
  const options = device_id ? { device_id } : {};

  try {
    const clientInstance = await getAuthenticatedClient();

    if (!clientInstance) {
      throw new Error("No authenticated client available");
    }

    await clientInstance.client.setShuffle(state, options);
  } catch (err: any) {
    const errorObject = JSON.parse(err.response);
    console.error(errorObject);
    throw new Error(
      `Issue with getCurrentlyPlayingTrack  - ${errorObject.error.message}`
    );
  }

  return;
}

// https://developer.spotify.com/documentation/web-api/reference/get-playlist
export async function getRandomTrackFromPlaylist(
  playlistId: string,
  market: string = "CA"
) {
  try {
    const clientInstance = await getAuthenticatedClient();

    if (!clientInstance) {
      throw new Error("No authenticated client available");
    }

    // Get playlist tracks
    const playlist = await clientInstance.client.getPlaylist(playlistId, {
      market,
    });

    if (
      playlist.tracks &&
      playlist.tracks.items &&
      playlist.tracks.items.length > 0
    ) {
      // Get a random track from the playlist
      const randomIndex = Math.floor(
        Math.random() * playlist.tracks.items.length
      );
      const randomTrack = playlist.tracks.items[randomIndex].track;

      // Check if the track is a valid track (not an episode)
      if (randomTrack && "artists" in randomTrack && "album" in randomTrack) {
        return {
          id: randomTrack.uri,
          uri: randomTrack.uri,
          name: randomTrack.name,
          artist: randomTrack.artists[0].name,
          album: randomTrack.album.name,
          albumCoverUrl:
            randomTrack.album.images && randomTrack.album.images.length > 0
              ? randomTrack.album.images[1]?.url ||
                randomTrack.album.images[0]?.url ||
                ""
              : "",
          year: (randomTrack.album as any).release_date
            ? new Date((randomTrack.album as any).release_date).getUTCFullYear()
            : new Date().getUTCFullYear(),
        };
      }
    }

    throw new Error("No valid tracks found in playlist");
  } catch (err: any) {
    const errorObject = JSON.parse(err.response);
    console.error(errorObject);
    throw new Error(
      `Issue with getRandomTrackFromPlaylist - ${errorObject.error.message}`
    );
  }
}
