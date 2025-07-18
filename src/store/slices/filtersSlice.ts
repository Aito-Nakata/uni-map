import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FilterState } from '@/types';

interface ExtendedFilterState extends FilterState {
  cabinetFilter: 'all' | 'few' | 'medium' | 'many';
  openNowOnly: boolean;
  favoritesOnly: boolean;
  sortBy: 'distance' | 'name' | 'cabinets' | 'updated';
  showClosed: boolean;
}

const initialState: ExtendedFilterState = {
  versions: [],
  facilities: [],
  searchKeyword: '',
  maxDistance: 50, // Default 50km
  cabinetFilter: 'all',
  openNowOnly: false,
  favoritesOnly: false,
  sortBy: 'distance',
  showClosed: true,
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setVersions: (state, action: PayloadAction<string[]>) => {
      state.versions = action.payload;
    },
    toggleVersion: (state, action: PayloadAction<string>) => {
      const version = action.payload;
      if (state.versions.includes(version)) {
        state.versions = state.versions.filter(v => v !== version);
      } else {
        state.versions.push(version);
      }
    },
    setFacilities: (state, action: PayloadAction<string[]>) => {
      state.facilities = action.payload;
    },
    toggleFacility: (state, action: PayloadAction<string>) => {
      const facility = action.payload;
      if (state.facilities.includes(facility)) {
        state.facilities = state.facilities.filter(f => f !== facility);
      } else {
        state.facilities.push(facility);
      }
    },
    setSearchKeyword: (state, action: PayloadAction<string>) => {
      state.searchKeyword = action.payload;
    },
    setMaxDistance: (state, action: PayloadAction<number>) => {
      state.maxDistance = action.payload;
    },
    setCabinetFilter: (state, action: PayloadAction<'all' | 'few' | 'medium' | 'many'>) => {
      state.cabinetFilter = action.payload;
    },
    setOpenNowOnly: (state, action: PayloadAction<boolean>) => {
      state.openNowOnly = action.payload;
    },
    setFavoritesOnly: (state, action: PayloadAction<boolean>) => {
      state.favoritesOnly = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'distance' | 'name' | 'cabinets' | 'updated'>) => {
      state.sortBy = action.payload;
    },
    setShowClosed: (state, action: PayloadAction<boolean>) => {
      state.showClosed = action.payload;
    },
    resetFilters: (state) => {
      state.versions = [];
      state.facilities = [];
      state.searchKeyword = '';
      state.maxDistance = 50;
      state.cabinetFilter = 'all';
      state.openNowOnly = false;
      state.favoritesOnly = false;
      state.sortBy = 'distance';
      state.showClosed = true;
    },
  },
});

export const {
  setVersions,
  toggleVersion,
  setFacilities,
  toggleFacility,
  setSearchKeyword,
  setMaxDistance,
  setCabinetFilter,
  setOpenNowOnly,
  setFavoritesOnly,
  setSortBy,
  setShowClosed,
  resetFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;