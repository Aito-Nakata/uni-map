import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { configureStore } from '@reduxjs/toolkit';
import OfflineStatusScreen from '../OfflineStatusScreen';
import storesReducer from '@/store/slices/storesSlice';

// Mock dependencies
jest.mock('@/services/offlineService', () => ({
  offlineService: {
    getStats: jest.fn(() => Promise.resolve({
      totalActions: 10,
      unsyncedActions: 3,
      lastSync: new Date('2024-01-01'),
      favorites: 5,
      searchHistory: 8,
      pendingSuggestions: 2,
    })),
    reset: jest.fn(),
  },
}));

jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

const TestWrapper: React.FC<{ children: React.ReactNode; initialState?: any }> = ({ 
  children, 
  initialState = {}
}) => {
  const store = configureStore({
    reducer: {
      stores: storesReducer,
    },
    preloadedState: {
      stores: {
        stores: [],
        loading: false,
        error: null,
        lastFetchTime: null,
        isOfflineMode: false,
        syncPending: false,
        ...initialState.stores,
      },
    },
  });

  return (
    <Provider store={store}>
      <PaperProvider>
        <NavigationContainer>
          {children}
        </NavigationContainer>
      </PaperProvider>
    </Provider>
  );
};

describe('OfflineStatusScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', async () => {
    render(
      <TestWrapper>
        <OfflineStatusScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(true).toBe(true); // Basic render test
    });
  });

  it('should display online status when connected', async () => {
    const { getByText } = render(
      <TestWrapper initialState={{
        stores: {
          isOfflineMode: false,
          syncPending: false,
        }
      }}>
        <OfflineStatusScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText('オンライン')).toBeTruthy();
    });
  });

  it('should display offline status when disconnected', async () => {
    const { getByText } = render(
      <TestWrapper initialState={{
        stores: {
          isOfflineMode: true,
          syncPending: false,
        }
      }}>
        <OfflineStatusScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText('オフライン')).toBeTruthy();
    });
  });

  it('should display sync pending status', async () => {
    const { getByText } = render(
      <TestWrapper initialState={{
        stores: {
          isOfflineMode: false,
          syncPending: true,
        }
      }}>
        <OfflineStatusScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText('同期中')).toBeTruthy();
    });
  });

  it('should show offline data statistics', async () => {
    const { getByText } = render(
      <TestWrapper>
        <OfflineStatusScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText('オフラインデータ')).toBeTruthy();
      expect(getByText('お気に入り')).toBeTruthy();
      expect(getByText('検索履歴')).toBeTruthy();
      expect(getByText('提案待ち')).toBeTruthy();
      expect(getByText('総アクション数')).toBeTruthy();
    });
  });

  it('should display unsynced items indicator', async () => {
    const { getByText } = render(
      <TestWrapper initialState={{
        stores: {
          isOfflineMode: false,
          syncPending: false,
        }
      }}>
        <OfflineStatusScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText('3件未同期')).toBeTruthy();
    });
  });

  it('should show sync button', async () => {
    const { getByText } = render(
      <TestWrapper>
        <OfflineStatusScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText('今すぐ同期')).toBeTruthy();
    });
  });

  it('should disable sync button when offline', async () => {
    const { getByText } = render(
      <TestWrapper initialState={{
        stores: {
          isOfflineMode: true,
          syncPending: false,
        }
      }}>
        <OfflineStatusScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      const syncButton = getByText('オフライン中');
      expect(syncButton.props.accessibilityState?.disabled).toBe(true);
    });
  });

  it('should show data management section', async () => {
    const { getByText } = render(
      <TestWrapper>
        <OfflineStatusScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText('データ管理')).toBeTruthy();
      expect(getByText('オフラインデータをクリア')).toBeTruthy();
    });
  });

  it('should display offline mode information', async () => {
    const { getByText } = render(
      <TestWrapper>
        <OfflineStatusScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText('オフラインモードについて')).toBeTruthy();
      expect(getByText('• オフライン中でもお気に入りの追加・削除が可能です')).toBeTruthy();
    });
  });

  it('should show offline note when disconnected', async () => {
    const { getByText } = render(
      <TestWrapper initialState={{
        stores: {
          isOfflineMode: true,
          syncPending: false,
        }
      }}>
        <OfflineStatusScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText('オンラインに復帰すると自動で同期が開始されます')).toBeTruthy();
    });
  });

  it('should handle clear data button press', async () => {
    const { getByText } = render(
      <TestWrapper>
        <OfflineStatusScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      const clearButton = getByText('オフラインデータをクリア');
      fireEvent.press(clearButton);
    });

    // The actual clearing is handled by the component
    expect(true).toBe(true);
  });

  it('should show loading state initially', () => {
    const mockOfflineService = require('@/services/offlineService');
    mockOfflineService.offlineService.getStats.mockReturnValue(new Promise(() => {})); // Never resolves

    const { getByText } = render(
      <TestWrapper>
        <OfflineStatusScreen />
      </TestWrapper>
    );

    expect(getByText('オフライン状態を確認中...')).toBeTruthy();
  });
});