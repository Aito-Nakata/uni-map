import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

class LocationService {
  async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: '位置情報の許可',
            message: 'このアプリでは近くのゲームセンターを表示するために位置情報が必要です。',
            buttonNeutral: '後で',
            buttonNegative: 'キャンセル',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      try {
        const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        return result === RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
  }

  async getCurrentPosition(): Promise<LocationCoordinates> {
    const hasPermission = await this.requestLocationPermission();
    
    if (!hasPermission) {
      throw new Error('Location permission denied');
    }

    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Location error:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  showLocationErrorAlert(): void {
    Alert.alert(
      '位置情報エラー',
      '位置情報を取得できませんでした。設定で位置情報サービスが有効になっているかご確認ください。',
      [
        { text: 'OK', style: 'default' },
      ]
    );
  }

  // Default location (Tokyo Station) for fallback
  getDefaultLocation(): LocationCoordinates {
    return {
      latitude: 35.6812,
      longitude: 139.7671,
    };
  }
}

export const locationService = new LocationService();