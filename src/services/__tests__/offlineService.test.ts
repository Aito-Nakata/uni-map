import AsyncStorage from '@react-native-async-storage/async-storage';
import { offlineService } from '../offlineService';
import { Suggestion } from '@/types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({
    isConnected: true,
    isInternetReachable: true,
  })),
}));

describe('OfflineService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize with empty data when no stored data exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      
      await offlineService.initialize();
      
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@chunithm_offline_data');
    });

    it('should load existing data from storage', async () => {
      const mockData = {
        favorites: ['store-1'],
        searchHistory: ['search-term'],
        suggestions: [],
        actions: [],
        lastSync: Date.now(),
      };
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockData));
      
      await offlineService.initialize();
      
      expect(offlineService.getFavorites()).toEqual(['store-1']);
      expect(offlineService.getSearchHistory()).toEqual(['search-term']);
    });
  });

  describe('addFavorite', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      await offlineService.initialize();
    });

    it('should add favorite to the list', async () => {
      await offlineService.addFavorite('store-1');
      
      expect(offlineService.getFavorites()).toContain('store-1');
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should not add duplicate favorites', async () => {
      await offlineService.addFavorite('store-1');
      await offlineService.addFavorite('store-1');
      
      const favorites = offlineService.getFavorites();
      expect(favorites.filter(id => id === 'store-1')).toHaveLength(1);
    });
  });

  describe('removeFavorite', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      await offlineService.initialize();
      await offlineService.addFavorite('store-1');
    });

    it('should remove favorite from the list', async () => {
      await offlineService.removeFavorite('store-1');
      
      expect(offlineService.getFavorites()).not.toContain('store-1');
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('addSearchHistory', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      await offlineService.initialize();
    });

    it('should add search term to history', async () => {
      await offlineService.addSearchHistory('test search');
      
      expect(offlineService.getSearchHistory()).toContain('test search');
    });

    it('should move existing search to top', async () => {
      await offlineService.addSearchHistory('first');
      await offlineService.addSearchHistory('second');
      await offlineService.addSearchHistory('first');
      
      const history = offlineService.getSearchHistory();
      expect(history[0]).toBe('first');
      expect(history).toHaveLength(2);
    });

    it('should limit search history to 50 items', async () => {
      for (let i = 0; i < 55; i++) {
        await offlineService.addSearchHistory(`search-${i}`);
      }
      
      expect(offlineService.getSearchHistory()).toHaveLength(50);
    });
  });

  describe('addOfflineSuggestion', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      await offlineService.initialize();
    });

    it('should add suggestion to offline storage', async () => {
      const suggestion: Suggestion = {
        storeId: 'store-1',
        field: 'name',
        value: 'New Name',
        status: 'pending',
        anonymous: false,
        createdAt: new Date(),
      };

      await offlineService.addOfflineSuggestion('store-1', suggestion);
      
      const pendingSuggestions = offlineService.getPendingSuggestions();
      expect(pendingSuggestions).toHaveLength(1);
      expect(pendingSuggestions[0].suggestion.field).toBe('name');
    });
  });

  describe('getStats', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      await offlineService.initialize();
    });

    it('should return correct statistics', async () => {
      await offlineService.addFavorite('store-1');
      await offlineService.addSearchHistory('test');
      
      const stats = await offlineService.getStats();
      
      expect(stats.favorites).toBe(1);
      expect(stats.searchHistory).toBe(1);
      expect(stats.unsyncedActions).toBeGreaterThan(0);
    });
  });

  describe('reset', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      await offlineService.initialize();
      await offlineService.addFavorite('store-1');
    });

    it('should clear all offline data', async () => {
      await offlineService.reset();
      
      expect(offlineService.getFavorites()).toHaveLength(0);
      expect(offlineService.getSearchHistory()).toHaveLength(0);
      expect(offlineService.getUnsyncedActions()).toHaveLength(0);
    });
  });
});