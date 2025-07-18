import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, List, Switch, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/types';
import { useAppSelector } from '@/hooks/redux';
import Icon from '@/components/Icon.web';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { isOfflineMode, syncPending } = useAppSelector(state => state.stores);

  const getOfflineStatusColor = () => {
    if (isOfflineMode) return '#FF6B6B';
    if (syncPending) return '#FF9800';
    return '#4CAF50';
  };

  const getOfflineStatusText = () => {
    if (isOfflineMode) return 'オフライン';
    if (syncPending) return '同期中';
    return 'オンライン';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Network Status */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>ネットワーク状態</Text>
            
            <List.Item
              title="接続状態"
              description={getOfflineStatusText()}
              left={() => (
                <List.Icon 
                  icon={isOfflineMode ? "wifi-off" : "wifi"} 
                  color={getOfflineStatusColor()} 
                />
              )}
              right={() => (
                <View style={[styles.statusDot, { backgroundColor: getOfflineStatusColor() }]} />
              )}
              onPress={() => navigation.navigate('OfflineStatus')}
            />
            
            <Divider />
            
            <List.Item
              title="オフライン設定"
              description="データ同期とオフライン機能の管理"
              left={() => <List.Icon icon="sync" color="#2196F3" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => navigation.navigate('OfflineStatus')}
            />
          </Card.Content>
        </Card>

        {/* App Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>アプリ設定</Text>
            
            <List.Item
              title="通知"
              description="新しい店舗や情報更新の通知"
              left={() => <List.Icon icon="notifications" color="#FF9800" />}
              right={() => <Switch value={false} disabled />}
            />
            
            <Divider />
            
            <List.Item
              title="位置情報"
              description="現在地の使用許可"
              left={() => <List.Icon icon="location-on" color="#E91E63" />}
              right={() => <Switch value={true} disabled />}
            />
            
            <Divider />
            
            <List.Item
              title="テーマ"
              description="アプリの外観設定"
              left={() => <List.Icon icon="palette" color="#9C27B0" />}
              right={() => <List.Icon icon="chevron-right" />}
            />
          </Card.Content>
        </Card>

        {/* Data & Privacy */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>データとプライバシー</Text>
            
            <List.Item
              title="データ使用量"
              description="アプリのデータ使用状況"
              left={() => <List.Icon icon="data-usage" color="#607D8B" />}
              right={() => <List.Icon icon="chevron-right" />}
            />
            
            <Divider />
            
            <List.Item
              title="キャッシュクリア"
              description="一時的なデータを削除"
              left={() => <List.Icon icon="cleaning-services" color="#795548" />}
              right={() => <List.Icon icon="chevron-right" />}
            />
            
            <Divider />
            
            <List.Item
              title="プライバシーポリシー"
              description="データの取り扱いについて"
              left={() => <List.Icon icon="privacy-tip" color="#4CAF50" />}
              right={() => <List.Icon icon="open-in-new" />}
            />
          </Card.Content>
        </Card>

        {/* Support */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>サポート</Text>
            
            <List.Item
              title="ヘルプ"
              description="よくある質問と使い方"
              left={() => <List.Icon icon="help" color="#2196F3" />}
              right={() => <List.Icon icon="chevron-right" />}
            />
            
            <Divider />
            
            <List.Item
              title="フィードバック"
              description="改善のご意見をお聞かせください"
              left={() => <List.Icon icon="feedback" color="#FF5722" />}
              right={() => <List.Icon icon="open-in-new" />}
            />
            
            <Divider />
            
            <List.Item
              title="アプリについて"
              description="バージョン情報とライセンス"
              left={() => <List.Icon icon="info" color="#9E9E9E" />}
              right={() => <List.Icon icon="chevron-right" />}
            />
          </Card.Content>
        </Card>

        {/* App Info */}
        <View style={styles.appInfoContainer}>
          <Text style={styles.appName}>CHUNITHM Location Map</Text>
          <Text style={styles.version}>バージョン 1.0.0</Text>
          <Text style={styles.copyright}>© 2024 CHUNITHM Community</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignSelf: 'center',
  },
  appInfoContainer: {
    alignItems: 'center',
    padding: 32,
    marginTop: 16,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
    color: '#999',
  },
});

export default SettingsScreen;