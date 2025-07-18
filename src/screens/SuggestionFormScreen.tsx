import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  SegmentedButtons,
  Switch,
  HelperText,
  Chip,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchStoreById } from '@/store/slices/storesSlice';
import { storeApi } from '@/services/api';
import { offlineService } from '@/services/offlineService';
import SuggestionFieldSelector from '@/components/SuggestionFieldSelector';
import { Store, RootStackParamList, Suggestion } from '@/types';

type SuggestionFormRouteProp = RouteProp<RootStackParamList, 'SuggestionForm'>;
type SuggestionFormNavigationProp = StackNavigationProp<RootStackParamList, 'SuggestionForm'>;

interface FormData {
  field: string;
  value: any;
  comment: string;
  anonymous: boolean;
}

const SuggestionFormScreen: React.FC = () => {
  const route = useRoute<SuggestionFormRouteProp>();
  const navigation = useNavigation<SuggestionFormNavigationProp>();
  const dispatch = useAppDispatch();
  
  const { storeId } = route.params;
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    field: '',
    value: '',
    comment: '',
    anonymous: false,
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [fieldConfig, setFieldConfig] = useState<any>(null);
  
  const { user, isAuthenticated } = useAppSelector(state => state.user || { user: null, isAuthenticated: false });
  const { stores, isOfflineMode } = useAppSelector(state => state.stores);

  useEffect(() => {
    loadStoreData();
  }, [storeId]);

  useEffect(() => {
    validateForm();
  }, [formData]);

  const loadStoreData = async () => {
    try {
      setLoading(true);
      
      // First check cache
      const cachedStore = stores.find(s => s.id === storeId);
      if (cachedStore) {
        setStore(cachedStore);
        setLoading(false);
      }
      
      // Fetch fresh data
      const result = await dispatch(fetchStoreById(storeId)).unwrap();
      setStore(result);
    } catch (error) {
      console.error('Failed to load store:', error);
      Alert.alert('エラー', '店舗情報を読み込めませんでした。', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.field) {
      newErrors.field = '更新する項目を選択してください';
    }

    if (!formData.value || (typeof formData.value === 'string' && formData.value.trim() === '')) {
      newErrors.value = '新しい値を入力してください';
    }

    if (formData.comment && formData.comment.length > 500) {
      newErrors.comment = 'コメントは500文字以内で入力してください';
    }

    setErrors(newErrors);
  };

  const handleFieldChange = (field: string, config: any) => {
    setFormData(prev => ({
      ...prev,
      field,
      value: config.currentValue || '',
    }));
    setFieldConfig(config);
  };

  const handleValueChange = (value: any) => {
    setFormData(prev => ({ ...prev, value }));
  };

  const handleSubmit = async () => {
    if (Object.keys(errors).length > 0) {
      Alert.alert('入力エラー', '入力内容に問題があります。確認してください。');
      return;
    }

    try {
      setSubmitting(true);

      const suggestionData: Suggestion = {
        storeId,
        field: formData.field,
        value: formData.value,
        comment: formData.comment.trim() || undefined,
        userId: isAuthenticated ? user?.id : undefined,
        anonymous: formData.anonymous,
        status: 'pending',
        createdAt: new Date(),
        synced: false,
      };

      if (isOfflineMode || !(await offlineService.isOnline())) {
        // Save offline
        await offlineService.addOfflineSuggestion(storeId, suggestionData);
        Alert.alert(
          'オフライン保存',
          '提案をローカルに保存しました。オンライン復帰時に自動で送信されます。',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        // Submit online
        await storeApi.submitSuggestion(storeId, suggestionData);
        Alert.alert(
          '送信完了',
          '情報更新提案を送信しました。管理者による確認後、反映されます。',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Failed to submit suggestion:', error);
      // Try to save offline as fallback
      try {
        const suggestionData: Suggestion = {
          storeId,
          field: formData.field,
          value: formData.value,
          comment: formData.comment.trim() || undefined,
          userId: isAuthenticated ? user?.id : undefined,
          anonymous: formData.anonymous,
          status: 'pending',
          createdAt: new Date(),
          synced: false,
        };
        
        await offlineService.addOfflineSuggestion(storeId, suggestionData);
        Alert.alert(
          'オフライン保存',
          '送信に失敗しましたが、提案をローカルに保存しました。オンライン復帰時に再送信されます。',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } catch (offlineError) {
        Alert.alert('エラー', '提案の保存に失敗しました。');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>店舗情報を読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!store) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={64} color="#666" />
          <Text style={styles.errorText}>店舗が見つかりません</Text>
          <Button mode="contained" onPress={() => navigation.goBack()}>
            戻る
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Card style={styles.headerCard}>
            <Card.Content>
              <Text style={styles.storeTitle}>{store.name}</Text>
              <Text style={styles.storeSubtitle}>情報更新提案</Text>
              <Text style={styles.description}>
                店舗情報の修正や追加情報があれば、こちらからお知らせください。
                管理者が確認後、情報を更新いたします。
              </Text>
            </Card.Content>
          </Card>

          {/* Field Selector */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>更新する項目 *</Text>
              <SuggestionFieldSelector
                store={store}
                selectedField={formData.field}
                onFieldChange={handleFieldChange}
              />
              {errors.field && (
                <HelperText type="error" visible={!!errors.field}>
                  {errors.field}
                </HelperText>
              )}
            </Card.Content>
          </Card>

          {/* Value Input */}
          {fieldConfig && (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.sectionTitle}>
                  新しい値 * 
                  {fieldConfig.label && ` (${fieldConfig.label})`}
                </Text>
                
                {fieldConfig.currentValue && (
                  <View style={styles.currentValueContainer}>
                    <Text style={styles.currentValueLabel}>現在の値:</Text>
                    <Text style={styles.currentValueText}>
                      {Array.isArray(fieldConfig.currentValue) 
                        ? fieldConfig.currentValue.join(', ')
                        : fieldConfig.currentValue.toString()
                      }
                    </Text>
                  </View>
                )}

                {fieldConfig.type === 'text' && (
                  <TextInput
                    value={formData.value}
                    onChangeText={handleValueChange}
                    placeholder={fieldConfig.placeholder || '新しい値を入力'}
                    mode="outlined"
                    style={styles.textInput}
                    error={!!errors.value}
                  />
                )}

                {fieldConfig.type === 'multiline' && (
                  <TextInput
                    value={formData.value}
                    onChangeText={handleValueChange}
                    placeholder={fieldConfig.placeholder || '新しい値を入力'}
                    mode="outlined"
                    multiline
                    numberOfLines={4}
                    style={styles.textInput}
                    error={!!errors.value}
                  />
                )}

                {fieldConfig.type === 'number' && (
                  <TextInput
                    value={formData.value.toString()}
                    onChangeText={(text) => handleValueChange(parseInt(text) || 0)}
                    placeholder={fieldConfig.placeholder || '数値を入力'}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.textInput}
                    error={!!errors.value}
                  />
                )}

                {fieldConfig.type === 'select' && (
                  <SegmentedButtons
                    value={formData.value}
                    onValueChange={handleValueChange}
                    buttons={fieldConfig.options || []}
                    style={styles.segmentedButtons}
                  />
                )}

                {fieldConfig.type === 'multiSelect' && (
                  <View style={styles.chipContainer}>
                    {fieldConfig.options?.map((option: any) => (
                      <Chip
                        key={option.value}
                        selected={formData.value.includes(option.value)}
                        onPress={() => {
                          const newValue = formData.value.includes(option.value)
                            ? formData.value.filter((v: any) => v !== option.value)
                            : [...formData.value, option.value];
                          handleValueChange(newValue);
                        }}
                        style={styles.chip}
                      >
                        {option.label}
                      </Chip>
                    ))}
                  </View>
                )}

                {errors.value && (
                  <HelperText type="error" visible={!!errors.value}>
                    {errors.value}
                  </HelperText>
                )}
              </Card.Content>
            </Card>
          )}

          {/* Comment */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>コメント (任意)</Text>
              <Text style={styles.fieldDescription}>
                変更理由や追加情報があれば記入してください
              </Text>
              <TextInput
                value={formData.comment}
                onChangeText={(text) => setFormData(prev => ({ ...prev, comment: text }))}
                placeholder="例: 新しい筐体が追加されました"
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.textInput}
                error={!!errors.comment}
              />
              <HelperText type="info" visible={!errors.comment}>
                {formData.comment.length}/500文字
              </HelperText>
              {errors.comment && (
                <HelperText type="error" visible={!!errors.comment}>
                  {errors.comment}
                </HelperText>
              )}
            </Card.Content>
          </Card>

          {/* Privacy Options */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>プライバシー設定</Text>
              
              <View style={styles.switchRow}>
                <View style={styles.switchInfo}>
                  <Text style={styles.switchLabel}>匿名で送信</Text>
                  <Text style={styles.switchDescription}>
                    オンにすると、提案者の情報は表示されません
                  </Text>
                </View>
                <Switch
                  value={formData.anonymous}
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, anonymous: value }))
                  }
                  color="#2196F3"
                />
              </View>

              {!isAuthenticated && (
                <View style={styles.noteContainer}>
                  <Icon name="info" size={16} color="#FF8F00" />
                  <Text style={styles.noteText}>
                    ログインしていないため、自動的に匿名での送信となります
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>

          {/* Guidelines */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>ガイドライン</Text>
              <View style={styles.guidelinesList}>
                <Text style={styles.guidelineItem}>
                  • 正確で確認済みの情報のみ提案してください
                </Text>
                <Text style={styles.guidelineItem}>
                  • 営業時間の変更は公式情報を基に提案してください
                </Text>
                <Text style={styles.guidelineItem}>
                  • 不適切な内容は削除される場合があります
                </Text>
                <Text style={styles.guidelineItem}>
                  • 提案の承認には数日かかる場合があります
                </Text>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            disabled={Object.keys(errors).length > 0 || submitting}
            loading={submitting}
            style={styles.submitButton}
            labelStyle={styles.submitButtonLabel}
          >
            {submitting ? '送信中...' : '提案を送信'}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardContainer: {
    flex: 1,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginVertical: 16,
    textAlign: 'center',
  },
  headerCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  storeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  storeSubtitle: {
    fontSize: 16,
    color: '#2196F3',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  fieldDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  currentValueContainer: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  currentValueLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  currentValueText: {
    fontSize: 14,
    color: '#333',
  },
  textInput: {
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    marginBottom: 4,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 12,
    color: '#666',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  noteText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#FF8F00',
    flex: 1,
  },
  guidelinesList: {
    marginTop: 8,
  },
  guidelineItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  submitContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  submitButton: {
    paddingVertical: 8,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SuggestionFormScreen;