import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MapViewProps {
  style?: any;
  onPress?: () => void;
  region?: any;
  onRegionChange?: (region: any) => void;
  onRegionChangeComplete?: (region: any) => void;
  children?: React.ReactNode;
  showsUserLocation?: boolean;
  userLocationPriority?: string;
  provider?: string;
  loadingEnabled?: boolean;
  loadingIndicatorColor?: string;
  loadingBackgroundColor?: string;
  customMapStyle?: any;
  moveOnMarkerPress?: boolean;
  showsBuildings?: boolean;
  showsTraffic?: boolean;
  showsIndoors?: boolean;
  showsIndoorLevelPicker?: boolean;
  showsCompass?: boolean;
  showsScale?: boolean;
  showsPointsOfInterest?: boolean;
  showsMyLocationButton?: boolean;
  toolbarEnabled?: boolean;
  cacheEnabled?: boolean;
  zoomEnabled?: boolean;
  zoomTapEnabled?: boolean;
  zoomControlEnabled?: boolean;
  scrollEnabled?: boolean;
  scrollDuringRotateOrZoomEnabled?: boolean;
  rotateEnabled?: boolean;
  pitchEnabled?: boolean;
  mapPadding?: any;
  minZoomLevel?: number;
  maxZoomLevel?: number;
  kmlSrc?: string;
  compassOffset?: any;
  myLocationButtonOffset?: any;
  paddingAdjustmentBehavior?: string;
  onMapLoaded?: () => void;
  onMapReady?: () => void;
  onKmlReady?: () => void;
  onUserLocationChange?: (event: any) => void;
  onPanDrag?: (event: any) => void;
  onPoiClick?: (event: any) => void;
  onLongPress?: (event: any) => void;
  onMarkerPress?: (event: any) => void;
  onMarkerSelect?: (event: any) => void;
  onMarkerDeselect?: (event: any) => void;
  onMarkerDragStart?: (event: any) => void;
  onMarkerDrag?: (event: any) => void;
  onMarkerDragEnd?: (event: any) => void;
  onCalloutPress?: (event: any) => void;
  onDoublePress?: (event: any) => void;
  onIndoorBuildingFocused?: (event: any) => void;
  onIndoorLevelActivated?: (event: any) => void;
}

const MapView: React.FC<MapViewProps> = ({ 
  style, 
  children, 
  onPress,
  region,
  onRegionChange,
  onRegionChangeComplete,
  ...props 
}) => {
  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (onPress) {
      onPress();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <div
        style={styles.webMap}
        onClick={handleMapClick}
      >
        <Text style={styles.placeholder}>マップ (Web版)</Text>
        <Text style={styles.note}>
          実際のマップ機能はGoogle Maps APIが必要です
        </Text>
        {children}
      </div>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  webMap: {
    flex: 1,
    backgroundColor: '#e8f5e8',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    border: '2px dashed #ccc',
    cursor: 'pointer',
  },
  placeholder: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  note: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});

export default MapView;