import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchStores } from '@/store/slices/storesSlice';
import { setCurrentLocation, setMapRegion } from '@/store/slices/appSlice';
import { locationService } from '@/services/locationService';
import StoreMarker from './StoreMarker';
import { Store } from '@/types';

interface MapViewComponentProps {
  onStorePress: (store: Store) => void;
}

const MapViewComponent: React.FC<MapViewComponentProps> = ({ onStorePress }) => {
  const dispatch = useAppDispatch();
  const mapRef = useRef<MapView>(null);
  const [isLocationLoaded, setIsLocationLoaded] = useState(false);
  
  const { stores, loading } = useAppSelector((state) => state.stores);
  const { currentLocation, mapRegion } = useAppSelector((state) => state.app);
  const { versions, facilities, maxDistance } = useAppSelector((state) => state.filters);

  // Default region (Tokyo)
  const defaultRegion: Region = {
    latitude: 35.6812,
    longitude: 139.7671,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  useEffect(() => {
    loadCurrentLocation();
  }, []);

  useEffect(() => {
    if (mapRegion && !loading) {
      dispatch(fetchStores({
        ...mapRegion,
        filters: {
          versions,
          facilities,
          keyword: '', // Will be handled by search separately
        },
      }));
    }
  }, [mapRegion, dispatch, loading, versions, facilities]);

  const loadCurrentLocation = async () => {
    try {
      const location = await locationService.getCurrentPosition();
      dispatch(setCurrentLocation(location));
      
      const region: Region = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      
      dispatch(setMapRegion(region));
      setIsLocationLoaded(true);
      
      // Animate to user location
      if (mapRef.current) {
        mapRef.current.animateToRegion(region, 1000);
      }
    } catch (error) {
      console.error('Failed to get location:', error);
      locationService.showLocationErrorAlert();
      
      // Use default location (Tokyo)
      dispatch(setMapRegion(defaultRegion));
      setIsLocationLoaded(true);
    }
  };

  const onRegionChangeComplete = (region: Region) => {
    dispatch(setMapRegion(region));
  };

  const filterStores = (stores: Store[]): Store[] => {
    return stores.filter(store => {
      // Version filter
      if (versions.length > 0) {
        const hasMatchingVersion = store.chunithmInfo.versions.some(version =>
          versions.includes(version)
        );
        if (!hasMatchingVersion) return false;
      }

      // Facilities filter
      if (facilities.length > 0) {
        const hasMatchingFacility = store.chunithmInfo.facilities.some(facility =>
          facilities.includes(facility)
        );
        if (!hasMatchingFacility) return false;
      }

      // Distance filter
      if (currentLocation && store.distance) {
        if (store.distance > maxDistance) return false;
      }

      return true;
    });
  };

  const filteredStores = filterStores(stores);

  const getCurrentLocationMarker = () => {
    if (!currentLocation) return null;

    return (
      <Marker
        coordinate={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        }}
        title="現在地"
        pinColor="blue"
      />
    );
  };

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      initialRegion={mapRegion || defaultRegion}
      showsUserLocation={false} // We'll show custom marker
      showsMyLocationButton={true}
      showsCompass={true}
      showsScale={true}
      onRegionChangeComplete={onRegionChangeComplete}
      maxZoomLevel={18}
      minZoomLevel={8}
    >
      {getCurrentLocationMarker()}
      
      {filteredStores.map((store) => (
        <StoreMarker
          key={store.id}
          store={store}
          onPress={() => onStorePress(store)}
        />
      ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default MapViewComponent;