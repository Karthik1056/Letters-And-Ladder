import { auth } from '../../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TokenData {
  token: string;
  expiresAt: number;
  refreshToken: string;
}

export class TokenService {
  private static readonly TOKEN_KEY = 'auth_token_data';
  private static readonly TOKEN_DURATION = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds

  static async saveToken(): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const idToken = await user.getIdToken(true); // Force refresh
      const refreshToken = user.refreshToken;
      
      const tokenData: TokenData = {
        token: idToken,
        expiresAt: Date.now() + this.TOKEN_DURATION,
        refreshToken
      };

      await AsyncStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokenData));
    } catch (error) {
      console.error('Error saving token:', error);
      throw error;
    }
  }

  static async getValidToken(): Promise<string | null> {
    try {
      const storedData = await AsyncStorage.getItem(this.TOKEN_KEY);
      if (!storedData) return null;

      const tokenData: TokenData = JSON.parse(storedData);
      
      // Check if token is still valid (within 2 days)
      if (Date.now() > tokenData.expiresAt) {
        await this.clearToken();
        return null;
      }

      // Check if Firebase token needs refresh (Firebase tokens expire in 1 hour)
      const user = auth.currentUser;
      if (user) {
        const freshToken = await user.getIdToken(false); // Don't force refresh unless needed
        return freshToken;
      }

      return tokenData.token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  static async isTokenValid(): Promise<boolean> {
    const token = await this.getValidToken();
    return token !== null;
  }

  static async clearToken(): Promise<void> {
    await AsyncStorage.removeItem(this.TOKEN_KEY);
  }

  static async refreshTokenIfNeeded(): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user) return false;

      const storedData = await AsyncStorage.getItem(this.TOKEN_KEY);
      if (!storedData) return false;

      const tokenData: TokenData = JSON.parse(storedData);
      
      // If we're still within the 2-day window, refresh the Firebase token
      if (Date.now() < tokenData.expiresAt) {
        await this.saveToken(); // This will get a fresh Firebase token
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }
}