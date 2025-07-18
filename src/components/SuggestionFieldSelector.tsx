import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, RadioButton, Chip } from 'react-native-paper';
import Icon from '@/components/Icon.web';
import { Store } from '@/types';

interface SuggestionFieldSelectorProps {
  store: Store;
  selectedField: string;
  onFieldChange: (field: string, config: FieldConfig) => void;
}

interface FieldConfig {
  label: string;
  type: 'text' | 'multiline' | 'number' | 'select' | 'multiSelect' | 'time';
  currentValue?: any;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: (value: any) => string | null;
}

const SuggestionFieldSelector: React.FC<SuggestionFieldSelectorProps> = ({
  store,
  selectedField,
  onFieldChange,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('basic');

  const fieldCategories = {
    basic: {
      label: '基本情報',
      icon: 'info',
      fields: {
        name: {
          label: '店舗名',
          type: 'text' as const,
          currentValue: store.name,
          placeholder: '正確な店舗名を入力してください',
          validation: (value: string) => {
            if (!value || value.trim().length === 0) return '店舗名は必須です';
            if (value.length > 100) return '店舗名は100文字以内で入力してください';
            return null;
          },
        },
        address: {
          label: '住所',
          type: 'text' as const,
          currentValue: store.address,
          placeholder: '正確な住所を入力してください',
          validation: (value: string) => {
            if (!value || value.trim().length === 0) return '住所は必須です';
            if (value.length > 200) return '住所は200文字以内で入力してください';
            return null;
          },
        },
        specialNotice: {
          label: '特別お知らせ',
          type: 'multiline' as const,
          currentValue: store.specialNotice || '',
          placeholder: 'お知らせがあれば入力してください（例：土日は混雑が予想されます）',
          validation: (value: string) => {
            if (value && value.length > 300) return 'お知らせは300文字以内で入力してください';
            return null;
          },
        },
      },
    },
    chunithm: {
      label: 'CHUNITHM情報',
      icon: 'videogame-asset',
      fields: {
        cabinets: {
          label: '筐体数',
          type: 'number' as const,
          currentValue: store.chunithmInfo.cabinets,
          placeholder: '正確な筐体数を入力してください',
          validation: (value: number) => {
            if (!value || value < 1) return '筐体数は1台以上で入力してください';
            if (value > 50) return '筐体数は50台以下で入力してください';
            return null;
          },
        },
        versions: {
          label: '対応バージョン',
          type: 'multiSelect' as const,
          currentValue: store.chunithmInfo.versions,
          options: [
            { value: 'CHUNITHM', label: 'CHUNITHM' },
            { value: 'CHUNITHM PLUS', label: 'CHUNITHM PLUS' },
            { value: 'CHUNITHM AIR', label: 'CHUNITHM AIR' },
            { value: 'CHUNITHM AIR PLUS', label: 'CHUNITHM AIR PLUS' },
            { value: 'CHUNITHM STAR', label: 'CHUNITHM STAR' },
            { value: 'CHUNITHM STAR PLUS', label: 'CHUNITHM STAR PLUS' },
            { value: 'CHUNITHM AMAZON', label: 'CHUNITHM AMAZON' },
            { value: 'CHUNITHM AMAZON PLUS', label: 'CHUNITHM AMAZON PLUS' },
            { value: 'CHUNITHM CRYSTAL', label: 'CHUNITHM CRYSTAL' },
            { value: 'CHUNITHM CRYSTAL PLUS', label: 'CHUNITHM CRYSTAL PLUS' },
            { value: 'CHUNITHM PARADISE', label: 'CHUNITHM PARADISE' },
            { value: 'CHUNITHM NEW!!', label: 'CHUNITHM NEW!!' },
            { value: 'CHUNITHM NEW!! PLUS', label: 'CHUNITHM NEW!! PLUS' },
            { value: 'CHUNITHM SUN', label: 'CHUNITHM SUN' },
            { value: 'CHUNITHM SUN PLUS', label: 'CHUNITHM SUN PLUS' },
          ],
          validation: (value: string[]) => {
            if (!value || value.length === 0) return '最低1つのバージョンを選択してください';
            return null;
          },
        },
        facilities: {
          label: '設備・機能',
          type: 'multiSelect' as const,
          currentValue: store.chunithmInfo.facilities,
          options: [
            { value: 'PASELI', label: 'PASELI対応' },
            { value: 'TOURNAMENT', label: '大会対応' },
            { value: 'LIVE', label: 'ライブ対応' },
            { value: 'HEADPHONE', label: 'ヘッドホン対応' },
            { value: 'PRIVACY', label: 'プライバシー筐体' },
            { value: 'AIME', label: 'Aime対応' },
            { value: 'IC_CARD', label: 'ICカード対応' },
          ],
          validation: (value: string[]) => {
            return null; // Optional field
          },
        },
      },
    },
    hours: {
      label: '営業時間',
      icon: 'schedule',
      fields: {
        'businessHours.monday': {
          label: '月曜日の営業時間',
          type: 'text' as const,
          currentValue: `${store.businessHours.monday.open} - ${store.businessHours.monday.close}`,
          placeholder: '10:00 - 22:00 (定休日の場合は「定休日」)',
        },
        'businessHours.tuesday': {
          label: '火曜日の営業時間',
          type: 'text' as const,
          currentValue: `${store.businessHours.tuesday.open} - ${store.businessHours.tuesday.close}`,
          placeholder: '10:00 - 22:00 (定休日の場合は「定休日」)',
        },
        'businessHours.wednesday': {
          label: '水曜日の営業時間',
          type: 'text' as const,
          currentValue: `${store.businessHours.wednesday.open} - ${store.businessHours.wednesday.close}`,
          placeholder: '10:00 - 22:00 (定休日の場合は「定休日」)',
        },
        'businessHours.thursday': {
          label: '木曜日の営業時間',
          type: 'text' as const,
          currentValue: `${store.businessHours.thursday.open} - ${store.businessHours.thursday.close}`,
          placeholder: '10:00 - 22:00 (定休日の場合は「定休日」)',
        },
        'businessHours.friday': {
          label: '金曜日の営業時間',
          type: 'text' as const,
          currentValue: `${store.businessHours.friday.open} - ${store.businessHours.friday.close}`,
          placeholder: '10:00 - 22:00 (定休日の場合は「定休日」)',
        },
        'businessHours.saturday': {
          label: '土曜日の営業時間',
          type: 'text' as const,
          currentValue: `${store.businessHours.saturday.open} - ${store.businessHours.saturday.close}`,
          placeholder: '10:00 - 22:00 (定休日の場合は「定休日」)',
        },
        'businessHours.sunday': {
          label: '日曜日の営業時間',
          type: 'text' as const,
          currentValue: `${store.businessHours.sunday.open} - ${store.businessHours.sunday.close}`,
          placeholder: '10:00 - 22:00 (定休日の場合は「定休日」)',
        },
      },
    },
  };

  const handleFieldSelection = (field: string) => {
    const category = Object.entries(fieldCategories).find(([_, cat]) => 
      field in cat.fields
    );
    
    if (category) {
      const config = category[1].fields[field as keyof typeof category[1]['fields']] as FieldConfig;
      onFieldChange(field, config);
    }
  };

  const renderCategoryChips = () => {
    return (
      <View style={styles.categoryChips}>
        {Object.entries(fieldCategories).map(([key, category]) => (
          <Chip
            key={key}
            mode={selectedCategory === key ? 'flat' : 'outlined'}
            selected={selectedCategory === key}
            onPress={() => setSelectedCategory(key)}
            icon={category.icon}
            style={[
              styles.categoryChip,
              selectedCategory === key && styles.selectedCategoryChip
            ]}
            textStyle={[
              styles.categoryChipText,
              selectedCategory === key && styles.selectedCategoryChipText
            ]}
          >
            {category.label}
          </Chip>
        ))}
      </View>
    );
  };

  const renderFieldOptions = () => {
    const category = fieldCategories[selectedCategory as keyof typeof fieldCategories];
    if (!category) return null;

    return (
      <View style={styles.fieldOptions}>
        <Text style={styles.categoryTitle}>{category.label}</Text>
        <RadioButton.Group 
          onValueChange={handleFieldSelection} 
          value={selectedField}
        >
          {Object.entries(category.fields).map(([fieldKey, fieldConfig]) => (
            <View key={fieldKey} style={styles.fieldOption}>
              <RadioButton.Item
                label={fieldConfig.label}
                value={fieldKey}
                style={styles.radioItem}
                labelStyle={styles.radioLabel}
              />
              {fieldConfig.currentValue && (
                <Text style={styles.currentValue}>
                  現在: {
                    Array.isArray(fieldConfig.currentValue)
                      ? fieldConfig.currentValue.join(', ')
                      : fieldConfig.currentValue.toString()
                  }
                </Text>
              )}
            </View>
          ))}
        </RadioButton.Group>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderCategoryChips()}
      {renderFieldOptions()}
      
      {selectedField && (
        <View style={styles.selectedFieldInfo}>
          <Icon name="check-circle" size={16} color="#4CAF50" />
          <Text style={styles.selectedFieldText}>
            「{fieldCategories[selectedCategory as keyof typeof fieldCategories]?.fields[selectedField as keyof typeof fieldCategories[keyof typeof fieldCategories]['fields']]?.label}」を選択中
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCategoryChip: {
    backgroundColor: '#2196F3',
  },
  categoryChipText: {
    fontSize: 12,
  },
  selectedCategoryChipText: {
    color: 'white',
  },
  fieldOptions: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  fieldOption: {
    marginBottom: 8,
  },
  radioItem: {
    paddingVertical: 4,
  },
  radioLabel: {
    fontSize: 14,
  },
  currentValue: {
    fontSize: 12,
    color: '#666',
    marginLeft: 40,
    marginTop: -4,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  selectedFieldInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    marginTop: 8,
  },
  selectedFieldText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
});

export default SuggestionFieldSelector;