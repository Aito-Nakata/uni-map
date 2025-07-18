import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Linking, Alert } from 'react-native';
import { Text, Button, Card, Chip, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Store } from '@/types';
import { locationService } from '@/services/locationService';

interface DirectionsCardProps {
  store: Store;
  onClose: () => void;
}

const DirectionsCard: React.FC<DirectionsCardProps> = ({ store, onClose }) => {
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<{ walking: string; driving: string; transit: string } | null>(null);

  useEffect(() => {
    getCurrentLocation();
    calculateEstimatedTime();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const location = await locationService.getCurrentPosition();
      setCurrentLocation(location);
    } catch (error) {
      console.error('Failed to get current location:', error);
    }
  };

  const calculateEstimatedTime = () => {
    if (!store.distance) return;
    
    // Rough estimates based on distance
    const walkingSpeed = 5; // km/h
    const drivingSpeedCity = 25; // km/h in city
    const transitSpeed = 20; // km/h average for public transit
    
    const walkingTime = Math.round((store.distance / walkingSpeed) * 60);
    const drivingTime = Math.round((store.distance / drivingSpeedCity) * 60);
    const transitTime = Math.round((store.distance / transitSpeed) * 60) + 10; // Add 10 min for waiting
    
    setEstimatedTime({
      walking: formatTime(walkingTime),
      driving: formatTime(drivingTime),
      transit: formatTime(transitTime),
    });
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}分`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}時間${remainingMinutes}分` : `${hours}時間`;
  };

  const openInAppleMaps = () => {
    const [lng, lat] = store.location.coordinates;
    const url = `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`;
    
    Linking.openURL(url).catch(() => {
      Alert.alert('エラー', 'Apple Mapsを開けませんでした。');
    });
  };

  const openInGoogleMaps = () => {
    const [lng, lat] = store.location.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    
    Linking.openURL(url).catch(() => {
      Alert.alert('エラー', 'Google Mapsを開けませんでした。');
    });
  };

  const openInYahooMaps = () => {
    const [lng, lat] = store.location.coordinates;
    const url = `https://map.yahoo.co.jp/maps?type=scroll&lat=${lat}&lon=${lng}&z=16&mode=map`;
    
    Linking.openURL(url).catch(() => {
      Alert.alert('エラー', 'Yahoo!マップを開けませんでした。');
    });
  };

  const openInNavitimeTransit = () => {
    if (!currentLocation) {
      Alert.alert('エラー', '現在地を取得できませんでした。');
      return;
    }

    const [destLng, destLat] = store.location.coordinates;
    const { latitude: startLat, longitude: startLng } = currentLocation;
    const url = `https://www.navitime.co.jp/transfer/searchlist?orvStationName=${startLat},${startLng}&dnvStationName=${destLat},${destLng}`;
    
    Linking.openURL(url).catch(() => {
      Alert.alert('エラー', 'NAVITIMEを開けませんでした。');
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>経路案内</Text>
        <IconButton
          icon="close"
          size={24}
          onPress={onClose}
        />
      </View>

      <Card style={styles.storeCard}>
        <Card.Content>
          <Text style={styles.storeName}>{store.name}</Text>
          <Text style={styles.storeAddress}>{store.address}</Text>
          {store.distance && (
            <Text style={styles.distanceText}>
              現在地から約 {store.distance}km
            </Text>
          )}
        </Card.Content>
      </Card>

      {estimatedTime && (
        <Card style={styles.estimatesCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>推定所要時間</Text>
            
            <View style={styles.estimateRow}>
              <Icon name="directions-walk" size={20} color="#4CAF50" />
              <Text style={styles.estimateLabel}>徒歩</Text>
              <Chip mode="outlined" style={styles.timeChip}>
                {estimatedTime.walking}
              </Chip>
            </View>
            
            <View style={styles.estimateRow}>
              <Icon name="directions-car" size={20} color="#2196F3" />
              <Text style={styles.estimateLabel}>車</Text>
              <Chip mode="outlined" style={styles.timeChip}>
                {estimatedTime.driving}
              </Chip>
            </View>
            
            <View style={styles.estimateRow}>
              <Icon name="directions-transit" size={20} color="#FF9800" />
              <Text style={styles.estimateLabel}>公共交通機関</Text>
              <Chip mode="outlined" style={styles.timeChip}>
                {estimatedTime.transit}
              </Chip>
            </View>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.appsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>マップアプリで開く</Text>
          
          <View style={styles.appButtons}>
            <Button
              mode="contained"
              icon="map"
              onPress={openInAppleMaps}
              style={styles.appButton}
              labelStyle={styles.appButtonLabel}
            >
              Apple Maps
            </Button>
            
            <Button
              mode="contained"
              icon="map"
              onPress={openInGoogleMaps}
              style={[styles.appButton, styles.googleButton]}
              labelStyle={styles.appButtonLabel}
            >
              Google Maps
            </Button>
          </View>
          
          <View style={styles.appButtons}>
            <Button
              mode="outlined"
              icon="map"
              onPress={openInYahooMaps}
              style={styles.appButton}
              labelStyle={styles.appButtonLabel}
            >
              Yahoo!マップ
            </Button>
            
            <Button
              mode="outlined"
              icon="train"
              onPress={openInNavitimeTransit}
              style={styles.appButton}
              labelStyle={styles.appButtonLabel}
            >
              NAVITIME
            </Button>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.noteContainer}>
        <Text style={styles.noteText}>
          ※ 所要時間は目安です。交通状況や乗り継ぎにより変動する場合があります。
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  storeCard: {
    marginBottom: 16,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  distanceText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  estimatesCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  estimateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  estimateLabel: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  timeChip: {
    minWidth: 80,
  },
  appsCard: {
    marginBottom: 16,
  },
  appButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  appButton: {
    flex: 1,
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  appButtonLabel: {
    fontSize: 12,
  },
  noteContainer: {
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  noteText: {
    fontSize: 12,
    color: '#FF8F00',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default DirectionsCard;