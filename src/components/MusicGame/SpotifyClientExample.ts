import {
  getOrCreateSpotifyClient,
  cleanupExpiredClients,
  SpotifyClientConfig,
  SpotifyClientInstance,
  auth,
  checkForAccessToken,
  CurrentToken,
} from "./SpotifyHelpers";

/**
 * Example usage of the Spotify client functions with PKCE authentication
 */

// Example configuration for PKCE flow (no client secret needed)
const spotifyConfig: SpotifyClientConfig = {
  clientID: process.env.REACT_APP_SPOTIFY_CLIENT_ID || "",
  redirectURL: "http://localhost:3000/callback",
  scope:
    "user-read-private user-read-email user-read-playback-state user-modify-playback-state",
};

// Token storage implementation for PKCE flow
class PKCETokenStorage implements CurrentToken {
  private _accessToken: string | null = null;
  private _refreshToken: string | null = null;
  private _expiresIn: string | null = null;
  private _expiresAt: string | null = null;

  get accessToken(): string | null {
    return this._accessToken || localStorage.getItem("spotify_access_token");
  }

  get refreshToken(): string | null {
    return this._refreshToken || localStorage.getItem("spotify_refresh_token");
  }

  get expiresIn(): string | null {
    return this._expiresIn || localStorage.getItem("spotify_expires_in");
  }

  get expiresAt(): string | null {
    return this._expiresAt || localStorage.getItem("spotify_expires_at");
  }

  save(response: any): void {
    this._accessToken = response.access_token;
    this._refreshToken = response.refresh_token;
    this._expiresIn = response.expires_in.toString();

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + response.expires_in);
    this._expiresAt = expiresAt.toISOString();

    // Store in localStorage
    localStorage.setItem("spotify_access_token", response.access_token);
    localStorage.setItem("spotify_refresh_token", response.refresh_token);
    localStorage.setItem("spotify_expires_in", response.expires_in.toString());
    localStorage.setItem("spotify_expires_at", this._expiresAt);
  }
}

/**
 * Example: Initialize PKCE authentication flow
 */
export function exampleInitiatePKCEAuth(): void {
  const tokenStorage = new PKCETokenStorage();

  // Start the PKCE authentication flow
  auth(
    spotifyConfig.clientID,
    spotifyConfig.redirectURL,
    spotifyConfig.scope ||
      "user-read-private user-read-email user-read-playback-state user-modify-playback-state"
  );
}

/**
 * Example: Handle authentication callback and get Spotify client
 */
export async function exampleHandleAuthCallback(): Promise<SpotifyClientInstance | null> {
  const tokenStorage = new PKCETokenStorage();

  try {
    // Check for access token and handle authentication
    await checkForAccessToken(
      spotifyConfig.clientID,
      spotifyConfig.redirectURL,
      tokenStorage
    );

    // If we have a valid access token, get or create the client
    if (tokenStorage.accessToken) {
      const clientInstance = await getOrCreateSpotifyClient(
        spotifyConfig,
        tokenStorage.accessToken
      );

      console.log("Successfully authenticated Spotify client:", clientInstance);
      return clientInstance;
    } else {
      console.log("No valid access token found");
      return null;
    }
  } catch (error) {
    console.error("Error handling auth callback:", error);
    return null;
  }
}

/**
 * Example: Get authenticated Spotify client (if already authenticated)
 */
export async function exampleGetAuthenticatedClient(): Promise<SpotifyClientInstance | null> {
  const tokenStorage = new PKCETokenStorage();

  try {
    // Check if we have a valid token
    if (tokenStorage.accessToken && tokenStorage.expiresAt) {
      const expiresAt = new Date(tokenStorage.expiresAt);
      if (expiresAt.getTime() > new Date().getTime()) {
        // Token is still valid
        const clientInstance = await getOrCreateSpotifyClient(
          spotifyConfig,
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
 * Example: Use authenticated client to search for tracks
 */
export async function exampleSearchTracks(query: string): Promise<any> {
  try {
    const clientInstance = await exampleGetAuthenticatedClient();

    if (!clientInstance) {
      throw new Error("No authenticated client available");
    }

    const searchResults = await clientInstance.client.searchTracks(query, {
      limit: 10,
      market: "US",
    });

    console.log("Search results:", searchResults);
    return searchResults;
  } catch (error) {
    console.error("Error searching tracks:", error);
    throw error;
  }
}

/**
 * Example: Get user's current playback
 */
export async function exampleGetCurrentPlayback(): Promise<any> {
  try {
    const clientInstance = await exampleGetAuthenticatedClient();

    if (!clientInstance) {
      throw new Error("No authenticated client available");
    }

    const playbackState =
      await clientInstance.client.getMyCurrentPlaybackState();

    console.log("Current playback:", playbackState);
    return playbackState;
  } catch (error) {
    console.error("Error getting current playback:", error);
    throw error;
  }
}

/**
 * Example: Start or resume playback
 */
export async function exampleStartPlayback(contextUri?: string): Promise<void> {
  try {
    const clientInstance = await exampleGetAuthenticatedClient();

    if (!clientInstance) {
      throw new Error("No authenticated client available");
    }

    if (contextUri) {
      await clientInstance.client.play({ context_uri: contextUri });
    } else {
      await clientInstance.client.play();
    }

    console.log("Playback started/resumed");
  } catch (error) {
    console.error("Error starting playback:", error);
    throw error;
  }
}

/**
 * Example: Pause playback
 */
export async function examplePausePlayback(): Promise<void> {
  try {
    const clientInstance = await exampleGetAuthenticatedClient();

    if (!clientInstance) {
      throw new Error("No authenticated client available");
    }

    await clientInstance.client.pause();
    console.log("Playback paused");
  } catch (error) {
    console.error("Error pausing playback:", error);
    throw error;
  }
}

/**
 * Example: Skip to next track
 */
export async function exampleSkipToNext(): Promise<void> {
  try {
    const clientInstance = await exampleGetAuthenticatedClient();

    if (!clientInstance) {
      throw new Error("No authenticated client available");
    }

    await clientInstance.client.skipToNext();
    console.log("Skipped to next track");
  } catch (error) {
    console.error("Error skipping track:", error);
    throw error;
  }
}

/**
 * Example: Complete PKCE authentication flow
 */
export async function exampleCompletePKCEFlow(): Promise<SpotifyClientInstance | null> {
  // Step 1: Check if we're returning from Spotify auth
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");

  if (code) {
    // We have an authorization code, handle the callback
    console.log("Handling auth callback with code:", code);
    return await exampleHandleAuthCallback();
  } else {
    // Check if we already have a valid token
    const clientInstance = await exampleGetAuthenticatedClient();

    if (clientInstance) {
      console.log("Already authenticated");
      return clientInstance;
    } else {
      // Need to start authentication flow
      console.log("Starting PKCE authentication flow");
      exampleInitiatePKCEAuth();
      return null;
    }
  }
}

/**
 * Example: Clean up expired clients
 */
export function exampleCleanup(): void {
  cleanupExpiredClients();
  console.log("Cleaned up expired Spotify clients");
}

/**
 * Example: Logout (clear tokens)
 */
export function exampleLogout(): void {
  localStorage.removeItem("spotify_access_token");
  localStorage.removeItem("spotify_refresh_token");
  localStorage.removeItem("spotify_expires_in");
  localStorage.removeItem("spotify_expires_at");
  localStorage.removeItem("code_verifier");
  console.log("Logged out - cleared all tokens");
}
