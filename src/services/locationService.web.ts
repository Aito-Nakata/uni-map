import { Alert, Platform } from 'react-native';

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp?: number;
}

export interface LocationError {
  code: number;
  message: string;
}

export class LocationService {
  private watchId: number | null = null;
  private lastKnownLocation: Location | null = null;

  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: position.timestamp,
          };
          
          this.lastKnownLocation = location;
          resolve(location);
        },
        (error) => {
          const locationError: LocationError = {
            code: error.code,
            message: error.message,
          };
          
          // Try to use last known location if available
          if (this.lastKnownLocation) {
            console.warn('Using last known location due to error:', error);
            resolve(this.lastKnownLocation);
          } else {
            reject(locationError);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  async requestLocationPermission(): Promise<boolean> {
    // In web, location permission is handled by the browser
    // We can't check permissions in advance, so we return true
    // and let the getCurrentLocation method handle the permission request
    return true;
  }

  watchLocation(
    onLocationUpdate: (location: Location) => void,
    onError?: (error: LocationError) => void
  ): void {
    if (!navigator.geolocation) {
      if (onError) {
        onError({
          code: -1,
          message: 'Geolocation is not supported by this browser',
        });
      }
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
          timestamp: position.timestamp,
        };
        
        this.lastKnownLocation = location;
        onLocationUpdate(location);
      },
      (error) => {
        const locationError: LocationError = {
          code: error.code,
          message: error.message,
        };
        
        if (onError) {
          onError(locationError);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  }

  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  async getLocationWithPermissionCheck(): Promise<Location | null> {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        Alert.alert(
          '位置情報の許可が必要です',
          '現在地を取得するには、位置情報の使用を許可してください。',
          [{ text: 'OK' }]
        );
        return null;
      }

      const location = await this.getCurrentLocation();
      return location;
    } catch (error) {
      console.error('Location error:', error);
      
      // Show user-friendly error message
      if (error instanceof Error) {
        Alert.alert(
          '位置情報の取得に失敗しました',
          error.message,
          [{ text: 'OK' }]
        );
      }
      
      return null;
    }
  }

  getLastKnownLocation(): Location | null {
    return this.lastKnownLocation;
  }

  isLocationEnabled(): boolean {
    return navigator.geolocation !== undefined;
  }
}

export const locationService = new LocationService();