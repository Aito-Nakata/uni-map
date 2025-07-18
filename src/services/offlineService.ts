import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
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

const OFFLINE_DATA_KEY = '@chunithm_offline_data';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

class OfflineService {
  private data: OfflineData = {
    favorites: [],
    searchHistory: [],
    suggestions: [],
    actions: [],
    lastSync: 0,
  };

  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_DATA_KEY);
      if (stored) {
        this.data = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to initialize offline service:', error);
    }
  }

  private async save(): Promise<void> {
    try {
      await AsyncStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }

  async isOnline(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected && state.isInternetReachable;
  }

  async addOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'synced'>): Promise<void> {
    const newAction: OfflineAction = {
      ...action,
      id: Date.now().toString(),
      timestamp: Date.now(),
      synced: false,
    };

    this.data.actions.push(newAction);
    await this.save();
  }

  async addFavorite(storeId: string): Promise<void> {
    if (!this.data.favorites.includes(storeId)) {
      this.data.favorites.push(storeId);
      await this.addOfflineAction({
        type: 'favorite',
        data: { storeId },
      });
    }
  }

  async removeFavorite(storeId: string): Promise<void> {
    this.data.favorites = this.data.favorites.filter(id => id !== storeId);
    await this.addOfflineAction({
      type: 'unfavorite',
      data: { storeId },
    });
  }

  async addSearchHistory(query: string): Promise<void> {
    // Remove existing entry if it exists
    this.data.searchHistory = this.data.searchHistory.filter(h => h !== query);
    
    // Add to beginning
    this.data.searchHistory.unshift(query);
    
    // Keep only last 50 searches
    this.data.searchHistory = this.data.searchHistory.slice(0, 50);
    
    await this.addOfflineAction({
      type: 'search_history',
      data: { query },
    });
  }

  async addOfflineSuggestion(storeId: string, suggestion: Suggestion): Promise<void> {
    this.data.suggestions.push({ storeId, suggestion });
    await this.addOfflineAction({
      type: 'suggestion',
      data: { storeId, suggestion },
    });
  }

  getFavorites(): string[] {
    return [...this.data.favorites];
  }

  getSearchHistory(): string[] {
    return [...this.data.searchHistory];
  }

  getPendingSuggestions(): Array<{ storeId: string; suggestion: Suggestion }> {
    return this.data.suggestions.filter(s => !s.suggestion.synced);
  }

  getUnsyncedActions(): OfflineAction[] {
    return this.data.actions.filter(action => !action.synced);
  }

  async markActionSynced(actionId: string): Promise<void> {
    const action = this.data.actions.find(a => a.id === actionId);
    if (action) {
      action.synced = true;
      await this.save();
    }
  }

  async markSuggestionSynced(storeId: string, suggestionId: string): Promise<void> {
    const suggestion = this.data.suggestions.find(
      s => s.storeId === storeId && s.suggestion.id === suggestionId
    );
    if (suggestion) {
      suggestion.suggestion.synced = true;
      await this.save();
    }
  }

  async syncWithServer(apiService: any): Promise<{ success: number; failed: number }> {
    if (!(await this.isOnline())) {
      return { success: 0, failed: 0 };
    }

    const unsyncedActions = this.getUnsyncedActions();
    let successCount = 0;
    let failedCount = 0;

    for (const action of unsyncedActions) {
      try {
        switch (action.type) {
          case 'favorite':
            await apiService.addToFavorites(action.data.storeId);
            break;
          case 'unfavorite':
            await apiService.removeFromFavorites(action.data.storeId);
            break;
          case 'search_history':
            await apiService.addSearchHistory(action.data.query);
            break;
          case 'suggestion':
            await apiService.submitSuggestion(action.data.storeId, action.data.suggestion);
            break;
        }
        
        await this.markActionSynced(action.id);
        successCount++;
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error);
        failedCount++;
      }
    }

    // Sync pending suggestions
    const pendingSuggestions = this.getPendingSuggestions();
    for (const { storeId, suggestion } of pendingSuggestions) {
      try {
        await apiService.submitSuggestion(storeId, suggestion);
        await this.markSuggestionSynced(storeId, suggestion.id!);
        successCount++;
      } catch (error) {
        console.error(`Failed to sync suggestion for store ${storeId}:`, error);
        failedCount++;
      }
    }

    this.data.lastSync = Date.now();
    await this.save();

    return { success: successCount, failed: failedCount };
  }

  async clearOldData(): Promise<void> {
    const now = Date.now();
    const cutoff = now - CACHE_EXPIRY;

    // Remove old synced actions
    this.data.actions = this.data.actions.filter(
      action => !action.synced || action.timestamp > cutoff
    );

    // Remove old synced suggestions
    this.data.suggestions = this.data.suggestions.filter(
      ({ suggestion }) => !suggestion.synced || (suggestion.createdAt && new Date(suggestion.createdAt).getTime() > cutoff)
    );

    await this.save();
  }

  async getStats(): Promise<{
    totalActions: number;
    unsyncedActions: number;
    lastSync: Date | null;
    favorites: number;
    searchHistory: number;
    pendingSuggestions: number;
  }> {
    return {
      totalActions: this.data.actions.length,
      unsyncedActions: this.getUnsyncedActions().length,
      lastSync: this.data.lastSync ? new Date(this.data.lastSync) : null,
      favorites: this.data.favorites.length,
      searchHistory: this.data.searchHistory.length,
      pendingSuggestions: this.getPendingSuggestions().length,
    };
  }

  async reset(): Promise<void> {
    this.data = {
      favorites: [],
      searchHistory: [],
      suggestions: [],
      actions: [],
      lastSync: 0,
    };
    await this.save();
  }
}

export const offlineService = new OfflineService();