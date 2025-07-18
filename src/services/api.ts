import NetInfo from '@react-native-community/netinfo';
import { Store, Suggestion, User, Region } from '@/types';
import { localDatabase } from './database';
import { locationService } from './locationService';

const API_BASE_URL = 'https://api.chunithm-map.com/v1'; // This would be your actual API URL

interface StoreQueryParams {
  lat: number;
  lng: number;
  radius: number;
  version?: string;
  facilities?: string;
  keyword?: string;
}

interface SuggestionPayload {
  field: string;
  value: any;
  comment?: string;
  userId?: string;
  anonymous?: boolean;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

class ApiService {
  private authTokens: AuthTokens | null = null;

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    // Add auth token if available
    if (this.authTokens?.accessToken) {
      headers.Authorization = `Bearer ${this.authTokens.accessToken}`;
    }

    const config: RequestInit = {
      headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401 && this.authTokens?.refreshToken) {
          // Try to refresh token
          await this.refreshAccessToken();
          // Retry the request with new token
          headers.Authorization = `Bearer ${this.authTokens?.accessToken}`;
          const retryResponse = await fetch(url, { ...config, headers });
          if (!retryResponse.ok) {
            throw new Error(`HTTP error! status: ${retryResponse.status}`);
          }
          return await retryResponse.json();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async isOnline(): Promise<boolean> {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected ?? false;
  }

  // Store operations
  async getStores(params: StoreQueryParams): Promise<Store[]> {
    try {
      const online = await this.isOnline();
      
      if (!online) {
        // Return cached data when offline
        console.log('Offline: returning cached stores');
        const cachedStores = await localDatabase.getStores();
        return this.filterStoresLocally(cachedStores, params);
      }

      // Check if cache is still valid
      const cacheValid = await localDatabase.isCacheValid(30); // 30 minutes
      if (cacheValid) {
        console.log('Using valid cache');
        const cachedStores = await localDatabase.getStores();
        return this.filterStoresLocally(cachedStores, params);
      }

      // Fetch from API
      const searchParams = new URLSearchParams({
        lat: params.lat.toString(),
        lng: params.lng.toString(),
        radius: params.radius.toString(),
      });

      if (params.version) {
        searchParams.append('version', params.version);
      }

      if (params.facilities) {
        searchParams.append('facilities', params.facilities);
      }

      if (params.keyword) {
        searchParams.append('keyword', params.keyword);
      }

      const stores = await this.request<Store[]>(`/stores?${searchParams.toString()}`);
      
      // Add distance calculation and save to cache
      const storesWithDistance = await this.addDistanceToStores(stores, params.lat, params.lng);
      await localDatabase.saveStores(storesWithDistance, {
        latitude: params.lat,
        longitude: params.lng,
        radius: params.radius,
      });

      return storesWithDistance;
    } catch (error) {
      console.error('Failed to fetch stores, falling back to cache:', error);
      // Fallback to cached data on error
      const cachedStores = await localDatabase.getStores();
      return this.filterStoresLocally(cachedStores, params);
    }
  }

  async getStoreById(id: string): Promise<Store> {
    try {
      const online = await this.isOnline();
      
      if (!online) {
        const cachedStore = await localDatabase.getStoreById(id);
        if (cachedStore) {
          return cachedStore;
        }
        throw new Error('Store not found in cache and device is offline');
      }

      const store = await this.request<Store>(`/stores/${id}`);
      
      // Update cache
      await localDatabase.updateStore(store);
      
      return store;
    } catch (error) {
      console.error('Failed to fetch store by id:', error);
      const cachedStore = await localDatabase.getStoreById(id);
      if (cachedStore) {
        return cachedStore;
      }
      throw error;
    }
  }

  // Suggestion operations
  async submitSuggestion(storeId: string, suggestion: SuggestionPayload): Promise<Suggestion> {
    const online = await this.isOnline();
    
    const suggestionData: Suggestion = {
      id: `temp_${Date.now()}`,
      storeId,
      field: suggestion.field,
      value: suggestion.value,
      status: 'pending',
      comment: suggestion.comment,
      userId: suggestion.userId,
      anonymous: suggestion.anonymous ?? false,
      createdAt: new Date(),
    };

    if (!online) {
      // Save locally for later sync
      await localDatabase.addSuggestion(suggestionData);
      return suggestionData;
    }

    try {
      const remoteSuggestion = await this.request<Suggestion>(`/stores/${storeId}/suggestions`, {
        method: 'POST',
        body: JSON.stringify(suggestion),
      });
      
      // Save to local cache
      await localDatabase.addSuggestion(remoteSuggestion);
      
      return remoteSuggestion;
    } catch (error) {
      console.error('Failed to submit suggestion, saving locally:', error);
      await localDatabase.addSuggestion(suggestionData);
      return suggestionData;
    }
  }

  async getSuggestions(storeId: string): Promise<Suggestion[]> {
    try {
      const online = await this.isOnline();
      
      if (!online) {
        return await localDatabase.getSuggestions(storeId);
      }

      const suggestions = await this.request<Suggestion[]>(`/stores/${storeId}/suggestions`);
      
      // Save to cache
      await localDatabase.saveSuggestions(storeId, suggestions);
      
      return suggestions;
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      return await localDatabase.getSuggestions(storeId);
    }
  }

  // Authentication operations
  async login(email: string, password: string): Promise<User> {
    const response = await this.request<{ user: User; tokens: AuthTokens }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.authTokens = response.tokens;
    await localDatabase.saveUser(response.user);
    
    return response.user;
  }

  async register(userData: { username: string; email: string; password: string }): Promise<User> {
    const response = await this.request<{ user: User; tokens: AuthTokens }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    this.authTokens = response.tokens;
    await localDatabase.saveUser(response.user);
    
    return response.user;
  }

  async logout(): Promise<void> {
    try {
      if (this.authTokens?.refreshToken) {
        await this.request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: this.authTokens.refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    }
    
    this.authTokens = null;
    await localDatabase.clearUser();
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.authTokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: this.authTokens.refreshToken }),
    });

    this.authTokens = response;
  }

  // Helper methods
  private async addDistanceToStores(stores: Store[], userLat: number, userLng: number): Promise<Store[]> {
    return stores.map(store => ({
      ...store,
      distance: locationService.calculateDistance(
        userLat,
        userLng,
        store.location.coordinates[1], // latitude
        store.location.coordinates[0]  // longitude
      ),
    }));
  }

  private filterStoresLocally(stores: Store[], params: StoreQueryParams): Store[] {
    return stores.filter(store => {
      // Distance filter
      if (store.distance && store.distance > params.radius) {
        return false;
      }

      // Version filter
      if (params.version) {
        const versions = params.version.split(',');
        const hasMatchingVersion = store.chunithmInfo.versions.some(v => 
          versions.includes(v)
        );
        if (!hasMatchingVersion) return false;
      }

      // Facilities filter
      if (params.facilities) {
        const facilities = params.facilities.split(',');
        const hasMatchingFacility = store.chunithmInfo.facilities.some(f => 
          facilities.includes(f)
        );
        if (!hasMatchingFacility) return false;
      }

      // Keyword filter
      if (params.keyword) {
        const keyword = params.keyword.toLowerCase();
        const nameMatch = store.name.toLowerCase().includes(keyword);
        const addressMatch = store.address.toLowerCase().includes(keyword);
        if (!nameMatch && !addressMatch) return false;
      }

      return true;
    });
  }

  // Data sync operations
  async syncPendingData(): Promise<void> {
    const online = await this.isOnline();
    if (!online) return;

    // This would sync any pending suggestions or data changes
    // Implementation depends on your offline strategy
    console.log('Syncing pending data...');
  }
}

export const storeApi = new ApiService();

// Mock data for development
export const mockStores: Store[] = [
  {
    id: '1',
    name: 'ゲームセンター東京',
    address: '東京都渋谷区渋谷1-1-1',
    location: {
      type: 'Point',
      coordinates: [139.7016, 35.6586], // [longitude, latitude] for Shibuya
    },
    businessHours: {
      monday: { open: '10:00', close: '22:00' },
      tuesday: { open: '10:00', close: '22:00' },
      wednesday: { open: '10:00', close: '22:00' },
      thursday: { open: '10:00', close: '22:00' },
      friday: { open: '10:00', close: '24:00' },
      saturday: { open: '10:00', close: '24:00' },
      sunday: { open: '10:00', close: '22:00' },
    },
    chunithmInfo: {
      cabinets: 4,
      versions: ['CHUNITHM SUN', 'CHUNITHM NEW!!'],
      facilities: ['PASELI', 'TOURNAMENT'],
    },
    specialNotice: '土日は混雑が予想されます',
    lastUpdated: new Date('2024-01-15'),
    updatedBy: 'admin',
    photos: [],
    distance: 1.2,
    isFavorite: false,
  },
  {
    id: '2',
    name: 'アミューズメント大阪',
    address: '大阪府大阪市中央区難波1-1-1',
    location: {
      type: 'Point',
      coordinates: [135.5006, 34.6669], // [longitude, latitude] for Namba
    },
    businessHours: {
      monday: { open: '11:00', close: '23:00' },
      tuesday: { open: '11:00', close: '23:00' },
      wednesday: { open: '11:00', close: '23:00' },
      thursday: { open: '11:00', close: '23:00' },
      friday: { open: '11:00', close: '25:00' },
      saturday: { open: '10:00', close: '25:00' },
      sunday: { open: '10:00', close: '23:00' },
    },
    chunithmInfo: {
      cabinets: 6,
      versions: ['CHUNITHM SUN', 'CHUNITHM NEW!!', 'CHUNITHM PARADISE'],
      facilities: ['PASELI', 'TOURNAMENT', 'LIVE'],
    },
    lastUpdated: new Date('2024-01-20'),
    updatedBy: 'user123',
    photos: [],
    distance: 2.5,
    isFavorite: true,
  },
];