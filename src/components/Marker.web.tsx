import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MarkerProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  description?: string;
  identifier?: string;
  onPress?: () => void;
  onSelect?: () => void;
  onDeselect?: () => void;
  onCalloutPress?: () => void;
  onDragStart?: () => void;
  onDrag?: () => void;
  onDragEnd?: () => void;
  draggable?: boolean;
  pinColor?: string;
  anchor?: { x: number; y: number };
  centerOffset?: { x: number; y: number };
  calloutOffset?: { x: number; y: number };
  image?: any;
  style?: any;
  children?: React.ReactNode;
  zIndex?: number;
  opacity?: number;
  rotation?: number;
  flat?: boolean;
  tracksViewChanges?: boolean;
  tracksInfoWindowChanges?: boolean;
  stopPropagation?: boolean;
}

const Marker: React.FC<MarkerProps> = ({
  coordinate,
  title,
  description,
  onPress,
  children,
  style,
  pinColor = '#FF0000',
  ...props
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  return (
    <View style={[styles.marker, style]} onClick={handlePress}>
      <View style={[styles.pin, { backgroundColor: pinColor }]}>
        <Text style={styles.pinText}>📍</Text>
      </View>
      {title && (
        <View style={styles.tooltip}>
          <Text style={styles.title}>{title}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  marker: {
    position: 'absolute',
    alignItems: 'center',
  },
  pin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pinText: {
    fontSize: 12,
    color: '#fff',
  },
  tooltip: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
});

export default Marker;