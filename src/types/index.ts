export interface Location {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface BusinessHours {
  monday: { open: string; close: string };
  tuesday: { open: string; close: string };
  wednesday: { open: string; close: string };
  thursday: { open: string; close: string };
  friday: { open: string; close: string };
  saturday: { open: string; close: string };
  sunday: { open: string; close: string };
}

export interface ChunithmInfo {
  cabinets: number;
  versions: string[];
  facilities: string[]; // "PASELI", "TOURNAMENT", etc.
}

export interface Store {
  id: string;
  name: string;
  address: string;
  location: Location;
  businessHours: BusinessHours;
  chunithmInfo: ChunithmInfo;
  specialNotice?: string;
  lastUpdated: Date;
  updatedBy?: string;
  photos: string[]; // URLs
  distance?: number; // Distance from user in km
  isFavorite?: boolean;
}

export interface Suggestion {
  id?: string;
  storeId: string;
  field: string;
  value: any;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  userId?: string;
  anonymous: boolean;
  createdAt?: Date;
  synced?: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  favorites: string[]; // Store IDs
  contributions: number;
  role: 'user' | 'moderator' | 'admin';
}

export interface FilterState {
  versions: string[];
  facilities: string[];
  searchKeyword: string;
  maxDistance: number; // km
}

export interface AppState {
  stores: Store[];
  currentLocation: {
    latitude: number;
    longitude: number;
  } | null;
  filters: FilterState;
  favorites: string[];
  isOnline: boolean;
  lastSyncTime: Date | null;
  loading: boolean;
  error: string | null;
}

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export type RootStackParamList = {
  Main: undefined;
  StoreDetail: { storeId: string };
  StoreList: undefined;
  Settings: undefined;
  SuggestionForm: { storeId: string };
  OfflineStatus: undefined;
};

export type TabParamList = {
  Map: undefined;
  List: undefined;
  Favorites: undefined;
  Settings: undefined;
};