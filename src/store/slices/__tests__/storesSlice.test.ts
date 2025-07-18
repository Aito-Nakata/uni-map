import { configureStore } from '@reduxjs/toolkit';
import storesReducer, {
  fetchStores,
  fetchStoreById,
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
  setOfflineMode,
} from '../storesSlice';
import { Store } from '@/types';

// Mock API
jest.mock('@/services/api', () => ({
  storeApi: {
    getStores: jest.fn(),
    getStoreById: jest.fn(),
    addToFavorites: jest.fn(),
    removeFromFavorites: jest.fn(),
  },
}));

// Mock offline service
jest.mock('@/services/offlineService', () => ({
  offlineService: {
    isOnline: jest.fn(() => Promise.resolve(true)),
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
    syncWithServer: jest.fn(() => Promise.resolve({ success: 0, failed: 0 })),
    clearOldData: jest.fn(),
  },
}));

const mockStore: Store = {
  id: 'store-1',
  name: 'テストゲームセンター',
  address: '東京都渋谷区1-1-1',
  location: {
    type: 'Point',
    coordinates: [139.7, 35.7]
  },
  businessHours: {
    monday: { open: '10:00', close: '22:00' },
    tuesday: { open: '10:00', close: '22:00' },
    wednesday: { open: '10:00', close: '22:00' },
    thursday: { open: '10:00', close: '22:00' },
    friday: { open: '10:00', close: '22:00' },
    saturday: { open: '10:00', close: '24:00' },
    sunday: { open: '10:00', close: '24:00' },
  },
  chunithmInfo: {
    cabinets: 4,
    versions: ['CHUNITHM SUN PLUS'],
    facilities: ['PASELI', 'AIME']
  },
  lastUpdated: new Date(),
  photos: [],
  isFavorite: false,
};

describe('storesSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        stores: storesReducer,
      },
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().stores;
      expect(state.stores).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.isOfflineMode).toBe(false);
      expect(state.syncPending).toBe(false);
    });
  });

  describe('toggleFavorite', () => {
    beforeEach(() => {
      store.dispatch({
        type: 'stores/fetchStores/fulfilled',
        payload: [mockStore],
      });
    });

    it('should toggle store favorite status', () => {
      store.dispatch(toggleFavorite('store-1'));
      
      const state = store.getState().stores;
      const store1 = state.stores.find(s => s.id === 'store-1');
      expect(store1?.isFavorite).toBe(true);
    });

    it('should toggle back to false', () => {
      store.dispatch(toggleFavorite('store-1'));
      store.dispatch(toggleFavorite('store-1'));
      
      const state = store.getState().stores;
      const store1 = state.stores.find(s => s.id === 'store-1');
      expect(store1?.isFavorite).toBe(false);
    });
  });

  describe('setOfflineMode', () => {
    it('should set offline mode to true', () => {
      store.dispatch(setOfflineMode(true));
      
      const state = store.getState().stores;
      expect(state.isOfflineMode).toBe(true);
    });

    it('should set offline mode to false', () => {
      store.dispatch(setOfflineMode(false));
      
      const state = store.getState().stores;
      expect(state.isOfflineMode).toBe(false);
    });
  });

  describe('fetchStores async thunk', () => {
    it('should handle pending state', () => {
      store.dispatch({
        type: fetchStores.pending.type,
      });
      
      const state = store.getState().stores;
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fulfilled state', () => {
      const stores = [mockStore];
      
      store.dispatch({
        type: fetchStores.fulfilled.type,
        payload: stores,
      });
      
      const state = store.getState().stores;
      expect(state.loading).toBe(false);
      expect(state.stores).toEqual(stores);
      expect(state.isOfflineMode).toBe(false);
    });

    it('should handle rejected state', () => {
      const errorMessage = 'Failed to fetch stores';
      
      store.dispatch({
        type: fetchStores.rejected.type,
        payload: errorMessage,
      });
      
      const state = store.getState().stores;
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
      expect(state.isOfflineMode).toBe(true);
    });
  });

  describe('fetchStoreById async thunk', () => {
    it('should add new store to list', () => {
      store.dispatch({
        type: fetchStoreById.fulfilled.type,
        payload: mockStore,
      });
      
      const state = store.getState().stores;
      expect(state.stores).toContain(mockStore);
    });

    it('should update existing store in list', () => {
      // First add the store
      store.dispatch({
        type: fetchStoreById.fulfilled.type,
        payload: mockStore,
      });
      
      // Then update it
      const updatedStore = { ...mockStore, name: 'Updated Name' };
      store.dispatch({
        type: fetchStoreById.fulfilled.type,
        payload: updatedStore,
      });
      
      const state = store.getState().stores;
      expect(state.stores).toHaveLength(1);
      expect(state.stores[0].name).toBe('Updated Name');
    });
  });
});