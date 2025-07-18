import { Store, Suggestion } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.chunithm-map.com/api';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

class WebStoreApi {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse<T> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'API request failed');
      }
      
      return result.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getStores(params?: {
    lat?: number;
    lng?: number;
    radius?: number;
    version?: string;
    facilities?: string;
    keyword?: string;
  }): Promise<Store[]> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request<Store[]>(`/stores${queryString}`);
  }

  async getStoreById(id: string): Promise<Store> {
    return this.request<Store>(`/stores/${id}`);
  }

  async submitSuggestion(storeId: string, suggestion: Suggestion): Promise<{ id: string }> {
    return this.request<{ id: string }>(`/stores/${storeId}/suggestions`, {
      method: 'POST',
      body: JSON.stringify(suggestion),
    });
  }

  async addToFavorites(storeId: string): Promise<void> {
    await this.request<void>('/favorites', {
      method: 'POST',
      body: JSON.stringify({ storeId }),
    });
  }

  async removeFromFavorites(storeId: string): Promise<void> {
    await this.request<void>(`/favorites/${storeId}`, {
      method: 'DELETE',
    });
  }

  async getFavorites(): Promise<string[]> {
    return this.request<string[]>('/favorites');
  }

  async addSearchHistory(query: string): Promise<void> {
    await this.request<void>('/search-history', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  async getSearchHistory(): Promise<string[]> {
    return this.request<string[]>('/search-history');
  }

  // Mock data for development/demo
  async getMockStores(): Promise<Store[]> {
    return [
      {
        id: 'store-1',
        name: 'ゲームセンター アキバ',
        address: '東京都千代田区秋葉原1-1-1',
        location: {
          type: 'Point',
          coordinates: [139.7737, 35.7021]
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
          cabinets: 6,
          versions: ['CHUNITHM SUN PLUS', 'CHUNITHM SUN'],
          facilities: ['PASELI', 'AIME', 'TOURNAMENT']
        },
        lastUpdated: new Date(),
        photos: [],
        distance: 0.5,
        isFavorite: false
      },
      {
        id: 'store-2',
        name: 'ハローワールド 渋谷店',
        address: '東京都渋谷区渋谷2-2-2',
        location: {
          type: 'Point',
          coordinates: [139.7016, 35.6598]
        },
        businessHours: {
          monday: { open: '11:00', close: '23:00' },
          tuesday: { open: '11:00', close: '23:00' },
          wednesday: { open: '11:00', close: '23:00' },
          thursday: { open: '11:00', close: '23:00' },
          friday: { open: '11:00', close: '24:00' },
          saturday: { open: '10:00', close: '24:00' },
          sunday: { open: '10:00', close: '23:00' },
        },
        chunithmInfo: {
          cabinets: 4,
          versions: ['CHUNITHM SUN PLUS'],
          facilities: ['PASELI', 'HEADPHONE']
        },
        lastUpdated: new Date(),
        photos: [],
        distance: 3.2,
        isFavorite: true
      },
      {
        id: 'store-3',
        name: 'プレイランド 新宿',
        address: '東京都新宿区新宿3-3-3',
        location: {
          type: 'Point',
          coordinates: [139.7043, 35.6896]
        },
        businessHours: {
          monday: { open: '10:00', close: '22:00' },
          tuesday: { open: '10:00', close: '22:00' },
          wednesday: { open: '10:00', close: '22:00' },
          thursday: { open: '10:00', close: '22:00' },
          friday: { open: '10:00', close: '24:00' },
          saturday: { open: '09:00', close: '24:00' },
          sunday: { open: '09:00', close: '22:00' },
        },
        chunithmInfo: {
          cabinets: 8,
          versions: ['CHUNITHM SUN', 'CHUNITHM PARADISE'],
          facilities: ['AIME', 'LIVE', 'PRIVACY']
        },
        lastUpdated: new Date(),
        photos: [],
        distance: 2.1,
        isFavorite: false
      }
    ];
  }
}

export const webStoreApi = new WebStoreApi();