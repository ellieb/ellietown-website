// TODO: use spotify-api.js library

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
  const authUrl = new URL("https://accounts.spotify.com/authorize");

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
  authUrl.search = new URLSearchParams(params).toString();

  // redirect to spotify auth page
  window.location.href = authUrl.toString();
};

/**
 * API wrappers
 */

async function baseAPIFunction({
  accessToken,
  url,
  method,
  headers,
  body,
}: {
  accessToken: string;
  url: string;
  method: "GET" | "PUT" | "POST";
  headers?: object;
  body?: BodyInit | null;
}) {
  const payload = {
    method,
    headers: {
      Authorization: "Bearer " + accessToken,
      ...headers,
    },
    ...(!!body && { body: body }),
  };

  const response = await fetch(url, payload);

  if (response.status !== 204 && response.status !== 200) {
    const body = await response.json();
    throw new Error(body.error.message);
  }

  return response;
}

// https://developer.spotify.com/documentation/web-api/reference/start-a-users-playback
export async function startOrResumePlayback(
  accessToken: string,
  contextUri?: string
) {
  // TODO: Add other params (device_id, uris, offset, etc)
  await baseAPIFunction({
    accessToken,
    url: "https://api.spotify.com/v1/me/player/play",
    method: "GET",
    headers: { "Content-Type": "application/json" },
    body: contextUri ? JSON.stringify({ context_uri: contextUri }) : null,
  });

  return;
}

// https://developer.spotify.com/documentation/web-api/reference/pause-a-users-playback
export async function pausePlayback(accessToken: string) {
  // TODO: Add other params (device_id)
  await baseAPIFunction({
    accessToken,
    url: "https://api.spotify.com/v1/me/player/pause",
    method: "PUT",
  });

  return;
}

// https://developer.spotify.com/documentation/web-api/reference/skip-users-playback-to-next-track
export async function skipToNext(accessToken: string) {
  // TODO: Add other params (device_id)
  await baseAPIFunction({
    accessToken,
    url: "https://api.spotify.com/v1/me/player/next",
    method: "POST",
  });

  return;
}

// https://developer.spotify.com/documentation/web-api/reference/get-the-users-currently-playing-track
export async function getCurrentlyPlayingTrack(accessToken: string) {
  // TODO: Add other params (device_id)
  const response = await baseAPIFunction({
    accessToken,
    url: "https://api.spotify.com/v1/me/player/currently-playing",
    method: "GET",
  });

  const body = await response.json();

  return body;
}

// https://developer.spotify.com/documentation/web-api/reference/get-information-about-the-users-current-playback
export async function getPlaybackState(
  accessToken: string,
  market: string = "ES"
) {
  const url = new URL("https://api.spotify.com/v1/me/player");
  const params = new URLSearchParams(url.search);
  params.append("market", market);

  const response = await baseAPIFunction({
    accessToken,
    url: url.toString(),
    method: "GET",
  });

  const body = response.json();

  return body;
}
