import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StoreListScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>店舗リスト画面（実装予定）</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
  },
});

export default StoreListScreen;