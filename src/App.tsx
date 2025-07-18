import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { PaperProvider } from 'react-native-paper';
import PaperIconProvider from './components/PaperIconProvider.web';
import { StatusBar, View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

import { store, persistor } from '@/store';
import { useAppDispatch } from '@/hooks/redux';
import { setOfflineMode, syncPendingData } from '@/store/slices/storesSlice';
import { offlineService } from '@/services/offlineService';
import OfflineIndicator from '@/components/OfflineIndicator';
import MapScreen from '@/screens/MapScreen';
import StoreListScreen from '@/screens/StoreListScreen';
import FavoritesScreen from '@/screens/FavoritesScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import StoreDetailScreen from '@/screens/StoreDetailScreen';
import SuggestionFormScreen from '@/screens/SuggestionFormScreen';
import OfflineStatusScreen from '@/screens/OfflineStatusScreen';
import Icon from './components/Icon.web';

import type { RootStackParamList, TabParamList } from '@/types';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Map') {
            iconName = 'map';
          } else if (route.name === 'List') {
            iconName = 'list';
          } else if (route.name === 'Favorites') {
            iconName = 'favorite';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          }

          return <Icon name={iconName || 'circle'} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Map" 
        component={MapScreen}
        options={{ tabBarLabel: 'マップ' }}
      />
      <Tab.Screen 
        name="List" 
        component={StoreListScreen}
        options={{ tabBarLabel: 'リスト' }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen}
        options={{ tabBarLabel: 'お気に入り' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ tabBarLabel: '設定' }}
      />
    </Tab.Navigator>
  );
}

function MainNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Main" 
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="StoreDetail" 
        component={StoreDetailScreen}
        options={{ title: '店舗詳細' }}
      />
      <Stack.Screen 
        name="SuggestionForm" 
        component={SuggestionFormScreen}
        options={{ title: '情報更新提案' }}
      />
      <Stack.Screen 
        name="OfflineStatus" 
        component={OfflineStatusScreen}
        options={{ title: 'オフライン設定' }}
      />
    </Stack.Navigator>
  );
}

function AppContent() {
  const dispatch = useAppDispatch();
  const [isAppReady, setIsAppReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing app...');
        
        // Initialize offline service
        await offlineService.initialize();
        console.log('Offline service initialized');
        
        // Monitor network status
        const unsubscribe = NetInfo.addEventListener(state => {
          const isOffline = !state.isConnected || !state.isInternetReachable;
          dispatch(setOfflineMode(isOffline));
          
          // Auto-sync when coming back online
          if (!isOffline) {
            dispatch(syncPendingData());
          }
        });

        console.log('App initialization complete');
        setIsAppReady(true);
        
        return () => {
          unsubscribe();
        };
      } catch (err) {
        console.error('App initialization error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsAppReady(true); // Still show the app even if there's an error
      }
    };

    initializeApp();
  }, [dispatch]);

  const handleNetworkChange = (isConnected: boolean) => {
    dispatch(setOfflineMode(!isConnected));
    
    if (isConnected) {
      // Auto-sync when network is restored
      dispatch(syncPendingData());
    }
  };

  if (!isAppReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>アプリを初期化中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>エラーが発生しました</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorHint}>アプリを継続します...</Text>
      </View>
    );
  }

  return (
    <View style={styles.appContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <NavigationContainer>
        <OfflineIndicator onNetworkChange={handleNetworkChange} />
        <MainNavigator />
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PaperProvider 
          settings={{
            icon: PaperIconProvider,
          }}
        >
          <AppContent />
        </PaperProvider>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});