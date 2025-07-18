import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  currentLocation: {
    latitude: number;
    longitude: number;
  } | null;
  isOnline: boolean;
  lastSyncTime: Date | null;
  permissionsGranted: {
    location: boolean;
  };
  mapRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null;
}

const initialState: AppState = {
  currentLocation: null,
  isOnline: true,
  lastSyncTime: null,
  permissionsGranted: {
    location: false,
  },
  mapRegion: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setCurrentLocation: (state, action: PayloadAction<{ latitude: number; longitude: number }>) => {
      state.currentLocation = action.payload;
    },
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    setLastSyncTime: (state, action: PayloadAction<Date>) => {
      state.lastSyncTime = action.payload;
    },
    setLocationPermission: (state, action: PayloadAction<boolean>) => {
      state.permissionsGranted.location = action.payload;
    },
    setMapRegion: (state, action: PayloadAction<{
      latitude: number;
      longitude: number;
      latitudeDelta: number;
      longitudeDelta: number;
    }>) => {
      state.mapRegion = action.payload;
    },
  },
});

export const {
  setCurrentLocation,
  setOnlineStatus,
  setLastSyncTime,
  setLocationPermission,
  setMapRegion,
} = appSlice.actions;

export default appSlice.reducer;