import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import Icon from '@/components/Icon.web';
import { Store } from '@/types';

interface StoreMarkerProps {
  store: Store;
  onPress: () => void;
}

const StoreMarker: React.FC<StoreMarkerProps> = ({ store, onPress }) => {
  const getMarkerColor = () => {
    const cabinetCount = store.chunithmInfo.cabinets;
    if (cabinetCount >= 6) return '#4CAF50'; // Green for many cabinets
    if (cabinetCount >= 4) return '#FF9800'; // Orange for medium
    return '#F44336'; // Red for few cabinets
  };

  const hasLatestVersion = store.chunithmInfo.versions.includes('CHUNITHM SUN');
  const hasTournamentSupport = store.chunithmInfo.facilities.includes('TOURNAMENT');

  return (
    <Marker
      coordinate={{
        latitude: store.location.coordinates[1],
        longitude: store.location.coordinates[0],
      }}
      onPress={onPress}
      pinColor={getMarkerColor()}
    >
      <View style={[styles.markerContainer, { borderColor: getMarkerColor() }]}>
        <View style={[styles.markerBackground, { backgroundColor: getMarkerColor() }]}>
          <Icon name="videogame-asset" size={20} color="white" />
          <Text style={styles.cabinetCount}>{store.chunithmInfo.cabinets}</Text>
        </View>
        
        <View style={styles.badgeContainer}>
          {hasLatestVersion && (
            <View style={[styles.badge, styles.newBadge]}>
              <Text style={styles.badgeText}>NEW</Text>
            </View>
          )}
          {hasTournamentSupport && (
            <View style={[styles.badge, styles.tournamentBadge]}>
              <Icon name="emoji-events" size={10} color="white" />
            </View>
          )}
          {store.isFavorite && (
            <View style={[styles.badge, styles.favoriteBadge]}>
              <Icon name="favorite" size={10} color="white" />
            </View>
          )}
        </View>
      </View>

      <Callout tooltip onPress={onPress}>
        <View style={styles.calloutContainer}>
          <Text style={styles.calloutTitle}>{store.name}</Text>
          <Text style={styles.calloutSubtitle}>{store.address}</Text>
          <View style={styles.calloutInfo}>
            <Text style={styles.calloutDetail}>
              筐体数: {store.chunithmInfo.cabinets}台
            </Text>
            <Text style={styles.calloutDetail}>
              距離: {store.distance ? `${store.distance}km` : '不明'}
            </Text>
          </View>
          {store.specialNotice && (
            <Text style={styles.calloutNotice}>{store.specialNotice}</Text>
          )}
        </View>
      </Callout>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  cabinetCount: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  badgeContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    flexDirection: 'row',
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginLeft: 2,
  },
  newBadge: {
    backgroundColor: '#FF4444',
  },
  tournamentBadge: {
    backgroundColor: '#FFA500',
  },
  favoriteBadge: {
    backgroundColor: '#E91E63',
  },
  badgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  calloutContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    minWidth: 200,
    maxWidth: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  calloutSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  calloutInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  calloutDetail: {
    fontSize: 11,
    color: '#888',
  },
  calloutNotice: {
    fontSize: 11,
    color: '#FF6B6B',
    fontStyle: 'italic',
    marginTop: 4,
  },
});

export default StoreMarker;