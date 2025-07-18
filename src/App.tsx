import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { PaperProvider } from 'react-native-paper';
import PaperIconProvider from './components/PaperIconProvider.web';
import { StatusBar } from 'react-native';
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

  useEffect(() => {
    // Initialize offline service
    offlineService.initialize();
    
    // Monitor network status
    const unsubscribe = NetInfo.addEventListener(state => {
      const isOffline = !state.isConnected || !state.isInternetReachable;
      dispatch(setOfflineMode(isOffline));
      
      // Auto-sync when coming back online
      if (!isOffline) {
        dispatch(syncPendingData());
      }
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  const handleNetworkChange = (isConnected: boolean) => {
    dispatch(setOfflineMode(!isConnected));
    
    if (isConnected) {
      // Auto-sync when network is restored
      dispatch(syncPendingData());
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <NavigationContainer>
        <OfflineIndicator onNetworkChange={handleNetworkChange} />
        <MainNavigator />
      </NavigationContainer>
    </>
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