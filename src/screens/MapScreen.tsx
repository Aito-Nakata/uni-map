import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, Dimensions } from 'react-native';
import { FAB, Card, Text, Button, Portal, Modal, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import MapViewComponent from '@/components/MapView';
import FilterModal from '@/components/FilterModal';
import StoreQuickInfo from '@/components/StoreQuickInfo';
import SearchBar from '@/components/SearchBar';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { filterStores, getFilterSummary } from '@/utils/filterUtils';
import { Store, RootStackParamList } from '@/types';

type MapScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const { width, height } = Dimensions.get('window');

const MapScreen: React.FC = () => {
  const navigation = useNavigation<MapScreenNavigationProp>();
  const dispatch = useAppDispatch();
  
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showStoreInfo, setShowStoreInfo] = useState(false);
  
  const filters = useAppSelector((state) => state.filters);
  const { favorites } = useAppSelector((state) => state.user);
  const { isOnline } = useAppSelector((state) => state.app);
  const { stores } = useAppSelector((state) => state.stores);

  const handleStorePress = (store: Store) => {
    setSelectedStore(store);
    setShowStoreInfo(true);
  };

  const handleStoreDetail = () => {
    if (selectedStore) {
      setShowStoreInfo(false);
      navigation.navigate('StoreDetail', { storeId: selectedStore.id });
    }
  };

  const handleSearchChange = (query: string) => {
    // Search handling is now done by SearchBar component
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.versions.length > 0) count++;
    if (filters.facilities.length > 0) count++;
    if (filters.cabinetFilter !== 'all') count++;
    if (filters.openNowOnly) count++;
    if (filters.favoritesOnly) count++;
    return count;
  };

  const hasActiveFilters = () => {
    return getActiveFiltersCount() > 0 || filters.searchKeyword.trim().length > 0;
  };

  const handleMyLocationPress = () => {
    // This will be handled by the MapView component
    // You might want to add a method to MapView to handle this
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar 
          onSearch={handleSearchChange}
          placeholder="店舗名・地域名で検索"
        />
      </View>

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filtersLabel}>適用中のフィルター:</Text>
          <Chip
            mode="outlined"
            onPress={() => setShowFilterModal(true)}
            style={styles.filterSummaryChip}
            textStyle={styles.filterSummaryText}
          >
            {getFilterSummary(filters)}
          </Chip>
        </View>
      )}

      {/* Offline Notice */}
      {!isOnline && (
        <Card style={styles.offlineNotice}>
          <Card.Content>
            <Text style={styles.offlineText}>
              オフラインモードです。データが最新でない可能性があります。
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Map View */}
      <MapViewComponent onStorePress={handleStorePress} />

      {/* Filter FAB */}
      <FAB
        style={[styles.filterFab, hasActiveFilters() && styles.filterFabActive]}
        icon="filter-variant"
        onPress={() => setShowFilterModal(true)}
        label={hasActiveFilters() ? `フィルター (${getActiveFiltersCount()})` : "フィルター"}
      />

      {/* My Location FAB */}
      <FAB
        style={styles.locationFab}
        icon="crosshairs-gps"
        onPress={handleMyLocationPress}
        small
      />

      {/* Filter Modal */}
      <Portal>
        <Modal
          visible={showFilterModal}
          onDismiss={() => setShowFilterModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <FilterModal onClose={() => setShowFilterModal(false)} />
        </Modal>
      </Portal>

      {/* Store Quick Info Modal */}
      <Portal>
        <Modal
          visible={showStoreInfo}
          onDismiss={() => setShowStoreInfo(false)}
          contentContainerStyle={styles.storeInfoContainer}
        >
          {selectedStore && (
            <StoreQuickInfo
              store={selectedStore}
              onClose={() => setShowStoreInfo(false)}
              onViewDetails={handleStoreDetail}
            />
          )}
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filtersLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  filterSummaryChip: {
    alignSelf: 'flex-start',
  },
  filterSummaryText: {
    fontSize: 12,
  },
  offlineNotice: {
    margin: 16,
    backgroundColor: '#FFF3E0',
  },
  offlineText: {
    color: '#FF8F00',
    textAlign: 'center',
    fontSize: 14,
  },
  filterFab: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    backgroundColor: '#2196F3',
  },
  filterFabActive: {
    backgroundColor: '#FF5722',
  },
  locationFab: {
    position: 'absolute',
    right: 16,
    bottom: 180,
    backgroundColor: '#4CAF50',
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    padding: 20,
    maxHeight: height * 0.8,
  },
  storeInfoContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 100,
    borderRadius: 12,
    padding: 0,
    maxHeight: height * 0.6,
  },
});

export default MapScreen;