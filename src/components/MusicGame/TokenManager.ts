import {
  CurrentToken,
  refreshToken,
  SpotifyClientConfig,
} from "./SpotifyHelpers";

export class TokenManager {
  private refreshTimer: NodeJS.Timeout | null = null;
  private readonly REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes before expiry

  constructor(
    private config: SpotifyClientConfig,
    private tokenStorage: CurrentToken,
    private onTokenUpdate?: (newToken: string) => void
  ) {}

  /**
   * Start proactive token refresh monitoring
   * This will automatically refresh the token before it expires
   */
  startProactiveRefresh(): void {
    this.stopProactiveRefresh(); // Clear any existing timer

    if (!this.tokenStorage.expiresAt) {
      console.log("No expiration time set, cannot start proactive refresh");
      return;
    }

    const expiresAt = new Date(this.tokenStorage.expiresAt);
    const now = new Date();
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();
    const refreshTime = timeUntilExpiry - this.REFRESH_BUFFER_MS;

    if (refreshTime <= 0) {
      // Token is already expired or about to expire, refresh immediately
      this.refreshTokenNow();
      return;
    }

    console.log(
      `Token will be refreshed in ${Math.round(
        refreshTime / 1000 / 60
      )} minutes`
    );

    this.refreshTimer = setTimeout(() => {
      this.refreshTokenNow();
    }, refreshTime);
  }

  /**
   * Stop proactive refresh monitoring
   */
  stopProactiveRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Refresh token immediately
   */
  private async refreshTokenNow(): Promise<void> {
    try {
      console.log("Proactively refreshing token...");
      const newToken = await refreshToken(
        this.config.clientID,
        this.tokenStorage
      );
      this.tokenStorage.save(newToken);

      // Notify parent component of token update
      if (this.onTokenUpdate) {
        this.onTokenUpdate(newToken.access_token);
      }

      // Restart proactive refresh for the new token
      this.startProactiveRefresh();

      console.log("Token refreshed successfully");
    } catch (error) {
      console.error("Failed to refresh token:", error);
      // Handle refresh failure - might need to re-authenticate
      this.handleRefreshFailure();
    }
  }

  /**
   * Handle refresh failure
   */
  private handleRefreshFailure(): void {
    console.error("Token refresh failed, user needs to re-authenticate");
    // Clear stored tokens
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("expires_at");

    // You might want to trigger a re-authentication flow here
    // or show a message to the user
  }

  /**
   * Check if token needs immediate refresh
   */
  needsImmediateRefresh(): boolean {
    if (!this.tokenStorage.expiresAt) return false;

    const expiresAt = new Date(this.tokenStorage.expiresAt);
    const now = new Date();
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();

    return timeUntilExpiry <= this.REFRESH_BUFFER_MS;
  }

  /**
   * Get a valid token, refreshing if necessary
   */
  async getValidToken(): Promise<string | null> {
    if (!this.tokenStorage.accessToken) {
      return null;
    }

    if (this.needsImmediateRefresh()) {
      await this.refreshTokenNow();
    }

    return this.tokenStorage.accessToken;
  }
}
