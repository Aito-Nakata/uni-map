import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { configureStore } from '@reduxjs/toolkit';
import SuggestionFormScreen from '../SuggestionFormScreen';
import storesReducer from '@/store/slices/storesSlice';
import { Store } from '@/types';

// Mock dependencies
jest.mock('@/services/api', () => ({
  storeApi: {
    submitSuggestion: jest.fn(),
  },
}));

jest.mock('@/services/offlineService', () => ({
  offlineService: {
    isOnline: jest.fn(() => Promise.resolve(true)),
    addOfflineSuggestion: jest.fn(),
  },
}));

jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

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
  photos: []
};

const Stack = createStackNavigator();

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
        stores: [mockStore],
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
          <Stack.Navigator>
            <Stack.Screen name="SuggestionForm" component={SuggestionFormScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </Provider>
  );
};

// Mock navigation params
const mockRoute = {
  params: { storeId: 'store-1' },
  key: 'test-key',
  name: 'SuggestionForm' as const,
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useRoute: () => mockRoute,
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

describe('SuggestionFormScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(
      <TestWrapper>
        <SuggestionFormScreen />
      </TestWrapper>
    );
  });

  it('should display store information', async () => {
    const { getByText } = render(
      <TestWrapper>
        <SuggestionFormScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText('テストゲームセンター')).toBeTruthy();
      expect(getByText('情報更新提案')).toBeTruthy();
    });
  });

  it('should show validation error for empty field selection', async () => {
    const { getByText } = render(
      <TestWrapper>
        <SuggestionFormScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      const submitButton = getByText('提案を送信');
      fireEvent.press(submitButton);
    });

    // Should show validation error (handled by Alert.alert in the component)
    // We can't easily test Alert.alert, but we can verify the button is disabled
    await waitFor(() => {
      const submitButton = getByText('提案を送信');
      expect(submitButton.props.accessibilityState?.disabled).toBe(true);
    });
  });

  it('should display field selector', async () => {
    const { getByText } = render(
      <TestWrapper>
        <SuggestionFormScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText('更新する項目 *')).toBeTruthy();
      expect(getByText('基本情報')).toBeTruthy();
      expect(getByText('CHUNITHM情報')).toBeTruthy();
    });
  });

  it('should show privacy settings section', async () => {
    const { getByText } = render(
      <TestWrapper>
        <SuggestionFormScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText('プライバシー設定')).toBeTruthy();
      expect(getByText('匿名で送信')).toBeTruthy();
    });
  });

  it('should show guidelines section', async () => {
    const { getByText } = render(
      <TestWrapper>
        <SuggestionFormScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText('ガイドライン')).toBeTruthy();
      expect(getByText('• 正確で確認済みの情報のみ提案してください')).toBeTruthy();
    });
  });

  it('should handle offline mode', async () => {
    const { getByText } = render(
      <TestWrapper initialState={{
        stores: {
          isOfflineMode: true,
        }
      }}>
        <SuggestionFormScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText('テストゲームセンター')).toBeTruthy();
    });
  });

  it('should show comment input field', async () => {
    const { getByText } = render(
      <TestWrapper>
        <SuggestionFormScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText('コメント (任意)')).toBeTruthy();
      expect(getByText('変更理由や追加情報があれば記入してください')).toBeTruthy();
    });
  });

  it('should display character count for comment', async () => {
    const { getByText } = render(
      <TestWrapper>
        <SuggestionFormScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText('0/500文字')).toBeTruthy();
    });
  });

  it('should show loading state initially', () => {
    const { getByText } = render(
      <TestWrapper initialState={{
        stores: {
          stores: [],
        }
      }}>
        <SuggestionFormScreen />
      </TestWrapper>
    );

    expect(getByText('店舗情報を読み込み中...')).toBeTruthy();
  });
});