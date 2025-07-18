import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, Linking, Dimensions } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  IconButton, 
  Chip, 
  Divider,
  Portal,
  Modal,
  ActivityIndicator
} from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from '@/components/Icon.web';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchStoreById } from '@/store/slices/storesSlice';
import { addFavorite, removeFavorite } from '@/store/slices/userSlice';
import StorePhotosCarousel from '@/components/StorePhotosCarousel';
import BusinessHoursCard from '@/components/BusinessHoursCard';
import DirectionsCard from '@/components/DirectionsCard';
import { Store, RootStackParamList } from '@/types';
import { isStoreOpenNow } from '@/utils/filterUtils';

type StoreDetailRouteProp = RouteProp<RootStackParamList, 'StoreDetail'>;
type StoreDetailNavigationProp = StackNavigationProp<RootStackParamList, 'StoreDetail'>;

const { width } = Dimensions.get('window');

const StoreDetailScreen: React.FC = () => {
  const route = useRoute<StoreDetailRouteProp>();
  const navigation = useNavigation<StoreDetailNavigationProp>();
  const dispatch = useAppDispatch();
  
  const { storeId } = route.params;
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDirections, setShowDirections] = useState(false);
  
  const { favorites } = useAppSelector(state => state.user);
  const { stores } = useAppSelector(state => state.stores);
  
  const isFavorite = favorites.includes(storeId);
  const isOpen = store ? isStoreOpenNow(store) : false;

  useEffect(() => {
    loadStoreDetail();
  }, [storeId]);

  const loadStoreDetail = async () => {
    try {
      setLoading(true);
      
      // First check if store is in cache
      const cachedStore = stores.find(s => s.id === storeId);
      if (cachedStore) {
        setStore(cachedStore);
        setLoading(false);
      }
      
      // Fetch fresh data
      const result = await dispatch(fetchStoreById(storeId)).unwrap();
      setStore(result);
    } catch (error) {
      console.error('Failed to load store details:', error);
      Alert.alert(
        'エラー',
        '店舗詳細を読み込めませんでした。',
        [
          { text: '戻る', onPress: () => navigation.goBack() },
          { text: '再試行', onPress: loadStoreDetail }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = () => {
    if (isFavorite) {
      dispatch(removeFavorite(storeId));
    } else {
      dispatch(addFavorite(storeId));
    }
  };

  const handleShare = () => {
    if (!store) return;
    
    const shareText = `${store.name}\n${store.address}\n\nチュウニズム筐体数: ${store.chunithmInfo.cabinets}台`;
    
    // In a real app, you would use React Native Share
    Alert.alert('共有', shareText);
  };

  const handleCall = () => {
    // In a real app, this would have the store's phone number
    Alert.alert('電話', '店舗の電話番号が登録されていません。');
  };

  const handleDirections = () => {
    setShowDirections(true);
  };

  const handleSuggestion = () => {
    navigation.navigate('SuggestionForm', { storeId });
  };

  const openInMaps = () => {
    if (!store) return;
    
    const [lng, lat] = store.location.coordinates;
    const url = `https://maps.apple.com/?q=${lat},${lng}`;
    
    Linking.openURL(url).catch(() => {
      Alert.alert('エラー', 'マップアプリを開けませんでした。');
    });
  };

  if (loading && !store) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>店舗詳細を読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!store) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={64} color="#666" />
          <Text style={styles.errorText}>店舗が見つかりません</Text>
          <Button mode="contained" onPress={() => navigation.goBack()}>
            戻る
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Store Photos */}
        {store.photos.length > 0 && (
          <StorePhotosCarousel photos={store.photos} />
        )}
        
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerRow}>
              <View style={styles.headerInfo}>
                <Text style={styles.storeName}>{store.name}</Text>
                <Text style={styles.storeAddress}>{store.address}</Text>
                
                <View style={styles.statusRow}>
                  <View style={[styles.statusBadge, isOpen ? styles.openBadge : styles.closedBadge]}>
                    <Text style={styles.statusText}>
                      {isOpen ? '営業中' : '営業時間外'}
                    </Text>
                  </View>
                  
                  {store.distance && (
                    <Text style={styles.distanceText}>
                      現在地から {store.distance}km
                    </Text>
                  )}
                </View>
              </View>
              
              <View style={styles.headerActions}>
                <IconButton
                  icon={isFavorite ? "favorite" : "favorite-border"}
                  iconColor={isFavorite ? "#E91E63" : "#666"}
                  size={28}
                  onPress={handleFavoriteToggle}
                />
                <IconButton
                  icon="share"
                  iconColor="#666"
                  size={28}
                  onPress={handleShare}
                />
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Special Notice */}
        {store.specialNotice && (
          <Card style={styles.noticeCard}>
            <Card.Content>
              <View style={styles.noticeHeader}>
                <Icon name="info" size={20} color="#FF8F00" />
                <Text style={styles.noticeTitle}>お知らせ</Text>
              </View>
              <Text style={styles.noticeText}>{store.specialNotice}</Text>
            </Card.Content>
          </Card>
        )}

        {/* CHUNITHM Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>CHUNITHM 情報</Text>
            
            <View style={styles.infoRow}>
              <Icon name="videogame-asset" size={20} color="#666" />
              <Text style={styles.infoText}>筐体数: {store.chunithmInfo.cabinets}台</Text>
            </View>
            
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>対応バージョン</Text>
              <View style={styles.chipsContainer}>
                {store.chunithmInfo.versions.map((version) => (
                  <Chip
                    key={version}
                    mode="flat"
                    style={styles.versionChip}
                    textStyle={styles.versionChipText}
                  >
                    {version}
                  </Chip>
                ))}
              </View>
            </View>
            
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>設備・機能</Text>
              <View style={styles.chipsContainer}>
                {store.chunithmInfo.facilities.map((facility) => (
                  <Chip
                    key={facility}
                    mode="outlined"
                    style={styles.facilityChip}
                    textStyle={styles.facilityChipText}
                  >
                    {facility}
                  </Chip>
                ))}
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Business Hours */}
        <BusinessHoursCard businessHours={store.businessHours} />

        {/* Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>アクション</Text>
            
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                icon="directions"
                onPress={handleDirections}
                style={styles.actionButton}
              >
                経路案内
              </Button>
              
              <Button
                mode="outlined"
                icon="phone"
                onPress={handleCall}
                style={styles.actionButton}
              >
                電話
              </Button>
            </View>
            
            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                icon="map"
                onPress={openInMaps}
                style={styles.actionButton}
              >
                マップで開く
              </Button>
              
              <Button
                mode="outlined"
                icon="edit"
                onPress={handleSuggestion}
                style={styles.actionButton}
              >
                情報修正提案
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Last Updated */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.lastUpdatedText}>
              最終更新: {store.lastUpdated.toLocaleDateString('ja-JP')}
              {store.updatedBy && ` (${store.updatedBy})`}
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Directions Modal */}
      <Portal>
        <Modal
          visible={showDirections}
          onDismiss={() => setShowDirections(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <DirectionsCard
            store={store}
            onClose={() => setShowDirections(false)}
          />
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginVertical: 16,
    textAlign: 'center',
  },
  headerCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerInfo: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  openBadge: {
    backgroundColor: '#E8F5E8',
  },
  closedBadge: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
  },
  noticeCard: {
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: '#FFF3E0',
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF8F00',
    marginLeft: 8,
  },
  noticeText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
  },
  subsection: {
    marginTop: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  versionChip: {
    backgroundColor: '#F3E5F5',
  },
  versionChipText: {
    color: '#7B1FA2',
    fontSize: 12,
  },
  facilityChip: {
    borderColor: '#2196F3',
  },
  facilityChipText: {
    color: '#2196F3',
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
});

export default StoreDetailScreen;