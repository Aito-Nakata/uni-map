import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Store, Region } from '@/types';
import { storeApi } from '@/services/api';
import { localDatabase } from '@/services/database';
import { offlineService } from '@/services/offlineService';

interface StoresState {
  stores: Store[];
  loading: boolean;
  error: string | null;
  lastFetchTime: Date | null;
  isOfflineMode: boolean;
  syncPending: boolean;
}

const initialState: StoresState = {
  stores: [],
  loading: false,
  error: null,
  lastFetchTime: null,
  isOfflineMode: false,
  syncPending: false,
};

interface FetchStoresParams extends Region {
  filters?: {
    versions?: string[];
    facilities?: string[];
    keyword?: string;
  };
}

export const fetchStores = createAsyncThunk(
  'stores/fetchStores',
  async (params: FetchStoresParams, { rejectWithValue }) => {
    try {
      const { filters, ...region } = params;
      
      const queryParams = {
        lat: region.latitude,
        lng: region.longitude,
        radius: 50, // 50km radius
        version: filters?.versions?.join(','),
        facilities: filters?.facilities?.join(','),
        keyword: filters?.keyword,
      };

      const response = await storeApi.getStores(queryParams);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchStoreById = createAsyncThunk(
  'stores/fetchStoreById',
  async (storeId: string, { rejectWithValue }) => {
    try {
      const response = await storeApi.getStoreById(storeId);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const loadCachedStores = createAsyncThunk(
  'stores/loadCachedStores',
  async () => {
    const cachedStores = await localDatabase.getStores();
    return cachedStores;
  }
);

export const syncPendingData = createAsyncThunk(
  'stores/syncPendingData',
  async (_, { dispatch }) => {
    const result = await offlineService.syncWithServer(storeApi);
    await offlineService.clearOldData();
    return result;
  }
);

export const addToFavorites = createAsyncThunk(
  'stores/addToFavorites',
  async (storeId: string, { getState, dispatch }) => {
    dispatch(toggleFavorite(storeId));
    
    try {
      if (await offlineService.isOnline()) {
        await storeApi.addToFavorites(storeId);
      } else {
        await offlineService.addFavorite(storeId);
      }
    } catch (error) {
      // Revert on error
      dispatch(toggleFavorite(storeId));
      throw error;
    }
  }
);

export const removeFromFavorites = createAsyncThunk(
  'stores/removeFromFavorites',
  async (storeId: string, { getState, dispatch }) => {
    dispatch(toggleFavorite(storeId));
    
    try {
      if (await offlineService.isOnline()) {
        await storeApi.removeFromFavorites(storeId);
      } else {
        await offlineService.removeFavorite(storeId);
      }
    } catch (error) {
      // Revert on error
      dispatch(toggleFavorite(storeId));
      throw error;
    }
  }
);

const storesSlice = createSlice({
  name: 'stores',
  initialState,
  reducers: {
    clearStores: (state) => {
      state.stores = [];
    },
    updateStoreInList: (state, action: PayloadAction<Store>) => {
      const index = state.stores.findIndex(store => store.id === action.payload.id);
      if (index !== -1) {
        state.stores[index] = action.payload;
      }
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const store = state.stores.find(s => s.id === action.payload);
      if (store) {
        store.isFavorite = !store.isFavorite;
      }
    },
    setOfflineMode: (state, action: PayloadAction<boolean>) => {
      state.isOfflineMode = action.payload;
    },
    setSyncPending: (state, action: PayloadAction<boolean>) => {
      state.syncPending = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch stores
      .addCase(fetchStores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStores.fulfilled, (state, action) => {
        state.loading = false;
        state.stores = action.payload;
        state.lastFetchTime = new Date();
        state.isOfflineMode = false;
      })
      .addCase(fetchStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch stores';
        state.isOfflineMode = true;
      })
      // Fetch store by ID
      .addCase(fetchStoreById.fulfilled, (state, action) => {
        const index = state.stores.findIndex(store => store.id === action.payload.id);
        if (index !== -1) {
          state.stores[index] = action.payload;
        } else {
          state.stores.push(action.payload);
        }
      })
      .addCase(fetchStoreById.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to fetch store';
      })
      // Load cached stores
      .addCase(loadCachedStores.fulfilled, (state, action) => {
        state.stores = action.payload;
        state.isOfflineMode = true;
      })
      // Sync pending data
      .addCase(syncPendingData.pending, (state) => {
        state.syncPending = true;
      })
      .addCase(syncPendingData.fulfilled, (state) => {
        state.syncPending = false;
      })
      .addCase(syncPendingData.rejected, (state) => {
        state.syncPending = false;
      });
  },
});

export const { 
  clearStores, 
  updateStoreInList, 
  toggleFavorite, 
  setOfflineMode, 
  setSyncPending 
} = storesSlice.actions;
export default storesSlice.reducer;