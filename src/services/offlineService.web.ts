import { Store, Suggestion } from '@/types';

interface OfflineAction {
  id: string;
  type: 'favorite' | 'unfavorite' | 'suggestion' | 'search_history';
  data: any;
  timestamp: number;
  synced: boolean;
}

interface OfflineData {
  favorites: string[];
  searchHistory: string[];
  suggestions: Array<{ storeId: string; suggestion: Suggestion }>;
  actions: OfflineAction[];
  lastSync: number;
}

const OFFLINE_DATA_KEY = 'chunithm_offline_data';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

class WebOfflineService {
  private data: OfflineData = {
    favorites: [],
    searchHistory: [],
    suggestions: [],
    actions: [],
    lastSync: 0,
  };

  async initialize(): Promise<void> {
    try {
      console.log('WebOfflineService: Starting initialization...');
      
      const stored = localStorage.getItem(OFFLINE_DATA_KEY);
      if (stored) {
        this.data = JSON.parse(stored);
        console.log('WebOfflineService: Loaded stored data');
      } else {
        console.log('WebOfflineService: No stored data found, using defaults');
      }
      
      console.log('WebOfflineService: Initialization complete');
    } catch (error) {
      console.error('WebOfflineService: Failed to initialize:', error);
      // Don't throw error, just log it
    }
  }

  private async save(): Promise<void> {
    try {
      localStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error('WebOfflineService: Failed to save data:', error);
    }
  }

  async addFavorite(storeId: string): Promise<void> {
    if (!this.data.favorites.includes(storeId)) {
      this.data.favorites.push(storeId);
      this.addAction('favorite', { storeId });
      await this.save();
    }
  }

  async removeFavorite(storeId: string): Promise<void> {
    this.data.favorites = this.data.favorites.filter(id => id !== storeId);
    this.addAction('unfavorite', { storeId });
    await this.save();
  }

  async addSearchHistory(query: string): Promise<void> {
    // Remove if already exists
    this.data.searchHistory = this.data.searchHistory.filter(q => q !== query);
    // Add to beginning
    this.data.searchHistory.unshift(query);
    // Keep only last 10 searches
    this.data.searchHistory = this.data.searchHistory.slice(0, 10);
    
    this.addAction('search_history', { query });
    await this.save();
  }

  async addSuggestion(storeId: string, suggestion: Suggestion): Promise<void> {
    this.data.suggestions.push({ storeId, suggestion });
    this.addAction('suggestion', { storeId, suggestion });
    await this.save();
  }

  private addAction(type: OfflineAction['type'], data: any): void {
    const action: OfflineAction = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: Date.now(),
      synced: false,
    };
    
    this.data.actions.push(action);
  }

  getFavorites(): string[] {
    return [...this.data.favorites];
  }

  getSearchHistory(): string[] {
    return [...this.data.searchHistory];
  }

  getSuggestions(): Array<{ storeId: string; suggestion: Suggestion }> {
    return [...this.data.suggestions];
  }

  getPendingActions(): OfflineAction[] {
    return this.data.actions.filter(action => !action.synced);
  }

  async markActionSynced(actionId: string): Promise<void> {
    const action = this.data.actions.find(a => a.id === actionId);
    if (action) {
      action.synced = true;
      await this.save();
    }
  }

  async clearSyncedActions(): Promise<void> {
    this.data.actions = this.data.actions.filter(action => !action.synced);
    await this.save();
  }

  isDataStale(): boolean {
    const now = Date.now();
    return (now - this.data.lastSync) > CACHE_EXPIRY;
  }

  async updateLastSync(): Promise<void> {
    this.data.lastSync = Date.now();
    await this.save();
  }

  async clearAll(): Promise<void> {
    this.data = {
      favorites: [],
      searchHistory: [],
      suggestions: [],
      actions: [],
      lastSync: 0,
    };
    localStorage.removeItem(OFFLINE_DATA_KEY);
  }
}

export const offlineService = new WebOfflineService();