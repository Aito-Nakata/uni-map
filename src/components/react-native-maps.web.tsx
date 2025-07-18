import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView from './MapView.web';
import Marker from './Marker.web';

// Export MapView as default
export default MapView;

// Export Marker as named export
export { Marker };

// Additional exports for compatibility
export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = 'default';

// Circle component stub
export const Circle: React.FC<any> = ({ center, radius, ...props }) => (
  <View style={styles.circle} />
);

// Polygon component stub  
export const Polygon: React.FC<any> = ({ coordinates, ...props }) => (
  <View style={styles.polygon} />
);

// Polyline component stub
export const Polyline: React.FC<any> = ({ coordinates, ...props }) => (
  <View style={styles.polyline} />
);

// Overlay component stub
export const Overlay: React.FC<any> = ({ bounds, image, ...props }) => (
  <View style={styles.overlay} />
);

// Callout component stub
export const Callout: React.FC<any> = ({ children, ...props }) => (
  <View style={styles.callout}>
    {children}
  </View>
);

// CalloutSubview component stub
export const CalloutSubview: React.FC<any> = ({ children, ...props }) => (
  <View style={styles.calloutSubview}>
    {children}
  </View>
);

// AnimatedRegion class stub
export class AnimatedRegion {
  constructor(region: any) {
    // Empty constructor
  }
  
  setValue(region: any) {
    // Empty method
  }
  
  timing(config: any) {
    return {
      start: (callback?: () => void) => {
        if (callback) callback();
      }
    };
  }
}

const styles = StyleSheet.create({
  circle: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    borderWidth: 2,
    borderColor: '#ff0000',
  },
  polygon: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 255, 0, 0.3)',
    borderWidth: 2,
    borderColor: '#00ff00',
  },
  polyline: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 255, 0.3)',
    height: 2,
  },
  overlay: {
    position: 'absolute',
    backgroundColor: 'rgba(128, 128, 128, 0.5)',
  },
  callout: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  calloutSubview: {
    backgroundColor: 'transparent',
  },
});