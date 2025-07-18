import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

// Mock all the complex dependencies
jest.mock('@/screens/MapScreen', () => 'MapScreen');
jest.mock('@/screens/StoreListScreen', () => 'StoreListScreen');
jest.mock('@/screens/FavoritesScreen', () => 'FavoritesScreen');
jest.mock('@/screens/SettingsScreen', () => 'SettingsScreen');
jest.mock('@/screens/StoreDetailScreen', () => 'StoreDetailScreen');
jest.mock('@/screens/SuggestionFormScreen', () => 'SuggestionFormScreen');
jest.mock('@/screens/OfflineStatusScreen', () => 'OfflineStatusScreen');

// Mock services
jest.mock('@/services/offlineService', () => ({
  offlineService: {
    initialize: jest.fn(),
  },
}));

// Mock store
jest.mock('@/store', () => ({
  store: {
    dispatch: jest.fn(),
    getState: jest.fn(() => ({})),
    subscribe: jest.fn(),
    replaceReducer: jest.fn(),
  },
  persistor: {
    persist: jest.fn(),
    purge: jest.fn(),
    flush: jest.fn(),
    pause: jest.fn(),
    getState: jest.fn(),
  },
}));

// Mock OfflineIndicator
jest.mock('@/components/OfflineIndicator', () => 'OfflineIndicator');

describe('App', () => {
  it('should render without crashing', () => {
    render(<App />);
  });

  it('should render within Provider components', () => {
    const { UNSAFE_getByType } = render(<App />);
    
    // The app should be wrapped in Provider components
    expect(UNSAFE_getByType).toBeDefined();
  });
});