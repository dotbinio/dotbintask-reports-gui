// Authentication service for token management

const TOKEN_KEY = 'taskwarrior_auth_token';

export const authService = {
  /**
   * Get the stored authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Store the authentication token
   */
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  /**
   * Remove the authentication token
   */
  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  /**
   * Check if user is authenticated (has a token)
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

