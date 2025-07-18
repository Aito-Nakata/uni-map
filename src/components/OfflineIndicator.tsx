import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Snackbar, Card } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface OfflineIndicatorProps {
  onNetworkChange?: (isConnected: boolean) => void;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ onNetworkChange }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected && state.isInternetReachable;
      
      if (connected !== isConnected) {
        setIsConnected(connected);
        setShowSnackbar(true);
        onNetworkChange?.(connected);
      }
    });

    // Get initial state
    NetInfo.fetch().then(state => {
      const connected = state.isConnected && state.isInternetReachable;
      setIsConnected(connected);
      onNetworkChange?.(connected);
    });

    return () => unsubscribe();
  }, [isConnected, onNetworkChange]);

  if (isConnected) {
    return (
      <Snackbar
        visible={showSnackbar && isConnected}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
        style={styles.onlineSnackbar}
      >
        <View style={styles.snackbarContent}>
          <Icon name="wifi" size={16} color="white" />
          <Text style={styles.snackbarText}>オンラインに復帰しました</Text>
        </View>
      </Snackbar>
    );
  }

  return (
    <>
      <Card style={styles.offlineBar}>
        <Card.Content style={styles.offlineContent}>
          <Icon name="wifi-off" size={20} color="#FF6B6B" />
          <Text style={styles.offlineText}>
            オフライン中 - 一部機能が制限されます
          </Text>
        </Card.Content>
      </Card>
      
      <Snackbar
        visible={showSnackbar && !isConnected}
        onDismiss={() => setShowSnackbar(false)}
        duration={5000}
        style={styles.offlineSnackbar}
      >
        <View style={styles.snackbarContent}>
          <Icon name="wifi-off" size={16} color="white" />
          <Text style={styles.snackbarText}>
            ネットワーク接続が切断されました
          </Text>
        </View>
      </Snackbar>
    </>
  );
};

const styles = StyleSheet.create({
  offlineBar: {
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: '#FFF3E0',
    elevation: 2,
  },
  offlineContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  offlineText: {
    marginLeft: 8,
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '500',
  },
  onlineSnackbar: {
    backgroundColor: '#4CAF50',
  },
  offlineSnackbar: {
    backgroundColor: '#FF6B6B',
  },
  snackbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  snackbarText: {
    marginLeft: 8,
    color: 'white',
    fontSize: 14,
  },
});

export default OfflineIndicator;