import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, Chip, IconButton, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { addFavorite, removeFavorite } from '@/store/slices/userSlice';
import { Store } from '@/types';

interface StoreQuickInfoProps {
  store: Store;
  onClose: () => void;
  onViewDetails: () => void;
}

const StoreQuickInfo: React.FC<StoreQuickInfoProps> = ({
  store,
  onClose,
  onViewDetails,
}) => {
  const dispatch = useAppDispatch();
  const { favorites } = useAppSelector((state) => state.user);
  
  const isFavorite = favorites.includes(store.id);

  const handleFavoriteToggle = () => {
    if (isFavorite) {
      dispatch(removeFavorite(store.id));
    } else {
      dispatch(addFavorite(store.id));
    }
  };

  const formatBusinessHours = (day: string) => {
    const hours = store.businessHours[day as keyof typeof store.businessHours];
    return `${hours.open} - ${hours.close}`;
  };

  const getTodayBusinessHours = () => {
    const today = new Date().getDay();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return formatBusinessHours(days[today]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.storeName}>{store.name}</Text>
          <Text style={styles.storeAddress}>{store.address}</Text>
        </View>
        <View style={styles.headerActions}>
          <IconButton
            icon={isFavorite ? "favorite" : "favorite-border"}
            iconColor={isFavorite ? "#E91E63" : "#666"}
            size={24}
            onPress={handleFavoriteToggle}
          />
          <IconButton
            icon="close"
            iconColor="#666"
            size={24}
            onPress={onClose}
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Basic Info */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.infoRow}>
              <Icon name="videogame-asset" size={20} color="#666" />
              <Text style={styles.infoText}>
                筐体数: {store.chunithmInfo.cabinets}台
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="location-on" size={20} color="#666" />
              <Text style={styles.infoText}>
                距離: {store.distance ? `${store.distance}km` : '不明'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="access-time" size={20} color="#666" />
              <Text style={styles.infoText}>
                本日: {getTodayBusinessHours()}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Versions */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>対応バージョン</Text>
            <View style={styles.chipsContainer}>
              {store.chunithmInfo.versions.map((version) => (
                <Chip
                  key={version}
                  mode="outlined"
                  style={styles.chip}
                  textStyle={styles.chipText}
                >
                  {version}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Facilities */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>設備・機能</Text>
            <View style={styles.chipsContainer}>
              {store.chunithmInfo.facilities.map((facility) => (
                <Chip
                  key={facility}
                  mode="flat"
                  style={styles.facilityChip}
                  textStyle={styles.facilityChipText}
                >
                  {facility}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Special Notice */}
        {store.specialNotice && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.noticeHeader}>
                <Icon name="info" size={20} color="#FF8F00" />
                <Text style={styles.noticeTitle}>お知らせ</Text>
              </View>
              <Text style={styles.noticeText}>{store.specialNotice}</Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={onClose}
          style={styles.actionButton}
        >
          閉じる
        </Button>
        <Button
          mode="contained"
          onPress={onViewDetails}
          style={styles.actionButton}
        >
          詳細を見る
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 4,
  },
  chipText: {
    fontSize: 12,
  },
  facilityChip: {
    backgroundColor: '#E3F2FD',
    marginRight: 8,
    marginBottom: 4,
  },
  facilityChipText: {
    fontSize: 12,
    color: '#1976D2',
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#FF8F00',
  },
  noticeText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});

export default StoreQuickInfo;