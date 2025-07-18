import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';
import { store } from '@/store';
import { setOnlineStatus, setLastSyncTime } from '@/store/slices/appSlice';
import { syncPendingData, loadCachedStores, setOfflineMode } from '@/store/slices/storesSlice';
import { storeApi } from './api';
import { localDatabase } from './database';

class SyncService {
  private syncInProgress = false;
  private appStateSubscription: any;
  private netInfoSubscription: any;

  init() {
    this.setupNetworkListener();
    this.setupAppStateListener();
    this.performInitialSync();
  }

  private setupNetworkListener() {
    this.netInfoSubscription = NetInfo.addEventListener(state => {
      const isOnline = state.isConnected ?? false;
      store.dispatch(setOnlineStatus(isOnline));
      store.dispatch(setOfflineMode(!isOnline));

      if (isOnline && !this.syncInProgress) {
        this.performSync();
      } else if (!isOnline) {
        // Load cached data when going offline
        store.dispatch(loadCachedStores());
      }
    });
  }

  private setupAppStateListener() {
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        // App came to foreground, check for sync
        this.checkAndSync();
      }
    });
  }

  private async performInitialSync() {
    try {
      const isOnline = await storeApi.isOnline();
      
      if (isOnline) {
        await this.performSync();
      } else {
        // Load cached data if offline
        store.dispatch(loadCachedStores());
      }
    } catch (error) {
      console.error('Initial sync failed:', error);
      // Fallback to cached data
      store.dispatch(loadCachedStores());
    }
  }

  private async checkAndSync() {
    const isOnline = await storeApi.isOnline();
    
    if (isOnline && !this.syncInProgress) {
      const lastSyncTime = await localDatabase.getLastSyncTime();
      const now = new Date();
      
      // Sync if more than 15 minutes since last sync
      if (!lastSyncTime || (now.getTime() - lastSyncTime.getTime()) > 15 * 60 * 1000) {
        await this.performSync();
      }
    }
  }

  async performSync(): Promise<void> {
    if (this.syncInProgress) return;

    this.syncInProgress = true;

    try {
      console.log('Starting data sync...');
      
      // Dispatch sync action
      await store.dispatch(syncPendingData()).unwrap();
      
      // Update last sync time
      const now = new Date();
      await localDatabase.setLastSyncTime(now);
      store.dispatch(setLastSyncTime(now));
      
      console.log('Data sync completed successfully');
    } catch (error) {
      console.error('Data sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  async forceSyncStores(): Promise<void> {
    const state = store.getState();
    const currentLocation = state.app.currentLocation;
    const filters = state.filters;

    if (currentLocation) {
      const { fetchStores } = await import('@/store/slices/storesSlice');
      
      try {
        await store.dispatch(fetchStores({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
          filters: {
            versions: filters.versions,
            facilities: filters.facilities,
            keyword: filters.searchKeyword,
          },
        })).unwrap();
      } catch (error) {
        console.error('Force sync stores failed:', error);
        // Fallback to cached data
        store.dispatch(loadCachedStores());
      }
    }
  }

  async syncFavorites(favorites: string[]): Promise<void> {
    try {
      await localDatabase.saveFavorites(favorites);
      console.log('Favorites synced to local storage');
    } catch (error) {
      console.error('Failed to sync favorites:', error);
    }
  }

  async loadPersistedData(): Promise<void> {
    try {
      // Load cached favorites
      const favorites = await localDatabase.getFavorites();
      if (favorites.length > 0) {
        // Update Redux state with cached favorites
        const { setUser } = await import('@/store/slices/userSlice');
        const user = await localDatabase.getUser();
        if (user) {
          store.dispatch(setUser({ ...user, favorites }));
        }
      }

      // Load cached stores
      const cacheValid = await localDatabase.isCacheValid(60); // 1 hour for persisted data
      if (cacheValid) {
        store.dispatch(loadCachedStores());
      }
    } catch (error) {
      console.error('Failed to load persisted data:', error);
    }
  }

  cleanup() {
    if (this.netInfoSubscription) {
      this.netInfoSubscription();
    }
    
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
  }
}

export const syncService = new SyncService();