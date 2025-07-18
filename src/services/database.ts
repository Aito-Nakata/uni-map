import AsyncStorage from '@react-native-async-storage/async-storage';
import { Store, Suggestion, User } from '@/types';

const STORAGE_KEYS = {
  STORES: '@chunithm_map/stores',
  SUGGESTIONS: '@chunithm_map/suggestions',
  USER: '@chunithm_map/user',
  LAST_SYNC: '@chunithm_map/last_sync',
  FAVORITES: '@chunithm_map/favorites',
  CACHE_METADATA: '@chunithm_map/cache_metadata',
};

interface CacheMetadata {
  storesLastUpdated: string;
  region: {
    latitude: number;
    longitude: number;
    radius: number;
  } | null;
}

class LocalDatabase {
  // Store operations
  async saveStores(stores: Store[], region?: { latitude: number; longitude: number; radius: number }): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores));
      
      const metadata: CacheMetadata = {
        storesLastUpdated: new Date().toISOString(),
        region: region || null,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.CACHE_METADATA, JSON.stringify(metadata));
    } catch (error) {
      console.error('Failed to save stores to local storage:', error);
    }
  }

  async getStores(): Promise<Store[]> {
    try {
      const storesJson = await AsyncStorage.getItem(STORAGE_KEYS.STORES);
      return storesJson ? JSON.parse(storesJson) : [];
    } catch (error) {
      console.error('Failed to get stores from local storage:', error);
      return [];
    }
  }

  async getStoreById(id: string): Promise<Store | null> {
    try {
      const stores = await this.getStores();
      return stores.find(store => store.id === id) || null;
    } catch (error) {
      console.error('Failed to get store by id:', error);
      return null;
    }
  }

  async updateStore(store: Store): Promise<void> {
    try {
      const stores = await this.getStores();
      const index = stores.findIndex(s => s.id === store.id);
      
      if (index !== -1) {
        stores[index] = store;
      } else {
        stores.push(store);
      }
      
      await this.saveStores(stores);
    } catch (error) {
      console.error('Failed to update store:', error);
    }
  }

  // Suggestions operations
  async saveSuggestions(storeId: string, suggestions: Suggestion[]): Promise<void> {
    try {
      const key = `${STORAGE_KEYS.SUGGESTIONS}_${storeId}`;
      await AsyncStorage.setItem(key, JSON.stringify(suggestions));
    } catch (error) {
      console.error('Failed to save suggestions:', error);
    }
  }

  async getSuggestions(storeId: string): Promise<Suggestion[]> {
    try {
      const key = `${STORAGE_KEYS.SUGGESTIONS}_${storeId}`;
      const suggestionsJson = await AsyncStorage.getItem(key);
      return suggestionsJson ? JSON.parse(suggestionsJson) : [];
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      return [];
    }
  }

  async addSuggestion(suggestion: Suggestion): Promise<void> {
    try {
      const suggestions = await this.getSuggestions(suggestion.storeId);
      suggestions.push(suggestion);
      await this.saveSuggestions(suggestion.storeId, suggestions);
    } catch (error) {
      console.error('Failed to add suggestion:', error);
    }
  }

  // User operations
  async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  }

  async getUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  }

  async clearUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
      console.error('Failed to clear user:', error);
    }
  }

  // Favorites operations
  async saveFavorites(favorites: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }

  async getFavorites(): Promise<string[]> {
    try {
      const favoritesJson = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      return favoritesJson ? JSON.parse(favoritesJson) : [];
    } catch (error) {
      console.error('Failed to get favorites:', error);
      return [];
    }
  }

  // Cache metadata operations
  async getCacheMetadata(): Promise<CacheMetadata | null> {
    try {
      const metadataJson = await AsyncStorage.getItem(STORAGE_KEYS.CACHE_METADATA);
      return metadataJson ? JSON.parse(metadataJson) : null;
    } catch (error) {
      console.error('Failed to get cache metadata:', error);
      return null;
    }
  }

  async isCacheValid(maxAgeMinutes: number = 30): Promise<boolean> {
    try {
      const metadata = await this.getCacheMetadata();
      if (!metadata || !metadata.storesLastUpdated) return false;
      
      const cacheTime = new Date(metadata.storesLastUpdated);
      const now = new Date();
      const diffMinutes = (now.getTime() - cacheTime.getTime()) / (1000 * 60);
      
      return diffMinutes < maxAgeMinutes;
    } catch (error) {
      console.error('Failed to check cache validity:', error);
      return false;
    }
  }

  // Sync operations
  async setLastSyncTime(time: Date): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, time.toISOString());
    } catch (error) {
      console.error('Failed to set last sync time:', error);
    }
  }

  async getLastSyncTime(): Promise<Date | null> {
    try {
      const timeString = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return timeString ? new Date(timeString) : null;
    } catch (error) {
      console.error('Failed to get last sync time:', error);
      return null;
    }
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
      
      // Also remove all suggestion keys
      const allKeys = await AsyncStorage.getAllKeys();
      const suggestionKeys = allKeys.filter(key => key.startsWith(STORAGE_KEYS.SUGGESTIONS));
      if (suggestionKeys.length > 0) {
        await AsyncStorage.multiRemove(suggestionKeys);
      }
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  }
}

export const localDatabase = new LocalDatabase();