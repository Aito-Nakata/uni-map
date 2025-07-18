import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  List, 
  ProgressBar, 
  Chip,
  ActivityIndicator,
  Divider 
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@/components/Icon.web';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { syncPendingData } from '@/store/slices/storesSlice';
import { offlineService } from '@/services/offlineService';

interface OfflineStats {
  totalActions: number;
  unsyncedActions: number;
  lastSync: Date | null;
  favorites: number;
  searchHistory: number;
  pendingSuggestions: number;
}

const OfflineStatusScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isOfflineMode, syncPending } = useAppSelector(state => state.stores);
  
  const [stats, setStats] = useState<OfflineStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const offlineStats = await offlineService.getStats();
      setStats(offlineStats);
    } catch (error) {
      console.error('Failed to load offline stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const handleSync = async () => {
    if (isOfflineMode) {
      return;
    }

    try {
      setSyncing(true);
      await dispatch(syncPendingData()).unwrap();
      await loadStats();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleClearOfflineData = async () => {
    try {
      await offlineService.reset();
      await loadStats();
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '未同期';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'たった今';
    if (diffInMinutes < 60) return `${diffInMinutes}分前`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}時間前`;
    return date.toLocaleDateString('ja-JP');
  };

  const getStatusColor = () => {
    if (isOfflineMode) return '#FF6B6B';
    if (stats && stats.unsyncedActions > 0) return '#FF9800';
    return '#4CAF50';
  };

  const getStatusText = () => {
    if (isOfflineMode) return 'オフライン';
    if (stats && stats.unsyncedActions > 0) return '同期待ち';
    return 'オンライン';
  };

  const getStatusIcon = () => {
    if (isOfflineMode) return 'wifi-off';
    if (stats && stats.unsyncedActions > 0) return 'sync-problem';
    return 'wifi';
  };

  if (!stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>オフライン状態を確認中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Status Overview */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.statusHeader}>
              <View style={styles.statusInfo}>
                <Icon name={getStatusIcon()} size={32} color={getStatusColor()} />
                <View style={styles.statusText}>
                  <Text style={[styles.statusTitle, { color: getStatusColor() }]}>
                    {getStatusText()}
                  </Text>
                  <Text style={styles.statusSubtitle}>
                    最終同期: {formatDate(stats.lastSync)}
                  </Text>
                </View>
              </View>
              
              {stats.unsyncedActions > 0 && (
                <Chip 
                  mode="outlined" 
                  style={[styles.unsyncedChip, { borderColor: '#FF9800' }]}
                  textStyle={{ color: '#FF9800' }}
                >
                  {stats.unsyncedActions}件未同期
                </Chip>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Sync Progress */}
        {(syncing || syncPending) && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>同期中...</Text>
              <ProgressBar indeterminate color="#2196F3" style={styles.progressBar} />
              <Text style={styles.progressText}>
                サーバーとデータを同期しています
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Sync Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>同期アクション</Text>
            
            <Button
              mode="contained"
              onPress={handleSync}
              disabled={isOfflineMode || syncing || syncPending}
              loading={syncing || syncPending}
              style={styles.syncButton}
              icon="sync"
            >
              {isOfflineMode ? 'オフライン中' : 
               syncing || syncPending ? '同期中...' : 
               '今すぐ同期'}
            </Button>
            
            {isOfflineMode && (
              <Text style={styles.offlineNote}>
                オンラインに復帰すると自動で同期が開始されます
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Offline Data Stats */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>オフラインデータ</Text>
            
            <List.Item
              title="お気に入り"
              description={`${stats.favorites}件`}
              left={() => <List.Icon icon="favorite" color="#E91E63" />}
              style={styles.listItem}
            />
            
            <Divider />
            
            <List.Item
              title="検索履歴"
              description={`${stats.searchHistory}件`}
              left={() => <List.Icon icon="history" color="#9C27B0" />}
              style={styles.listItem}
            />
            
            <Divider />
            
            <List.Item
              title="提案待ち"
              description={`${stats.pendingSuggestions}件`}
              left={() => <List.Icon icon="edit" color="#FF9800" />}
              style={styles.listItem}
            />
            
            <Divider />
            
            <List.Item
              title="総アクション数"
              description={`${stats.totalActions}件（未同期: ${stats.unsyncedActions}件）`}
              left={() => <List.Icon icon="storage" color="#607D8B" />}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>

        {/* Data Management */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>データ管理</Text>
            
            <Button
              mode="outlined"
              onPress={handleClearOfflineData}
              style={styles.clearButton}
              icon="delete"
              textColor="#F44336"
            >
              オフラインデータをクリア
            </Button>
            
            <Text style={styles.warningText}>
              ※ 未同期のデータも削除されます。注意してください。
            </Text>
          </Card.Content>
        </Card>

        {/* Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>オフラインモードについて</Text>
            
            <Text style={styles.infoText}>
              • オフライン中でもお気に入りの追加・削除が可能です{'\n'}
              • 検索履歴は自動で保存されます{'\n'}
              • 情報更新の提案はローカルに保存されます{'\n'}
              • オンライン復帰時に自動で同期されます{'\n'}
              • データは24時間後に自動削除されます
            </Text>
          </Card.Content>
        </Card>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusText: {
    marginLeft: 16,
    flex: 1,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  unsyncedChip: {
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  progressBar: {
    marginVertical: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  syncButton: {
    marginVertical: 8,
  },
  offlineNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  listItem: {
    paddingVertical: 4,
  },
  clearButton: {
    marginVertical: 8,
    borderColor: '#F44336',
  },
  warningText: {
    fontSize: 12,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});

export default OfflineStatusScreen;