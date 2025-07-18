import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Checkbox, Button, Divider, Switch, SegmentedButtons } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
  toggleVersion,
  toggleFacility,
  setMaxDistance,
  resetFilters,
} from '@/store/slices/filtersSlice';

interface FilterModalProps {
  onClose: () => void;
}

const AVAILABLE_VERSIONS = [
  'CHUNITHM SUN',
  'CHUNITHM NEW!!',
  'CHUNITHM PARADISE',
  'CHUNITHM CRYSTAL',
  'CHUNITHM STAR',
];

const AVAILABLE_FACILITIES = [
  { key: 'PASELI', label: 'PASELI対応' },
  { key: 'TOURNAMENT', label: '大会対応' },
  { key: 'LIVE', label: 'ライブ対応' },
  { key: 'HEADPHONE', label: 'ヘッドホン対応' },
  { key: 'PRIVACY', label: 'プライバシー筐体' },
];

const FilterModal: React.FC<FilterModalProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const { versions, facilities, maxDistance } = useAppSelector((state) => state.filters);
  const [cabinetFilter, setCabinetFilter] = useState('all');
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState('distance');

  const handleVersionToggle = (version: string) => {
    dispatch(toggleVersion(version));
  };

  const handleFacilityToggle = (facility: string) => {
    dispatch(toggleFacility(facility));
  };

  const handleDistanceChange = (value: number) => {
    dispatch(setMaxDistance(value));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
    setCabinetFilter('all');
    setOpenNowOnly(false);
    setFavoritesOnly(false);
    setSortBy('distance');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (versions.length > 0) count++;
    if (facilities.length > 0) count++;
    if (cabinetFilter !== 'all') count++;
    if (openNowOnly) count++;
    if (favoritesOnly) count++;
    return count;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>フィルター設定</Text>
        {getActiveFiltersCount() > 0 && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
          </View>
        )}
      </View>
      
      {/* Version Filter */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>バージョン</Text>
          {AVAILABLE_VERSIONS.map((version) => (
            <View key={version} style={styles.checkboxRow}>
              <Checkbox
                status={versions.includes(version) ? 'checked' : 'unchecked'}
                onPress={() => handleVersionToggle(version)}
              />
              <Text style={styles.checkboxLabel}>{version}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Facilities Filter */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>設備・機能</Text>
          {AVAILABLE_FACILITIES.map((facility) => (
            <View key={facility.key} style={styles.checkboxRow}>
              <Checkbox
                status={facilities.includes(facility.key) ? 'checked' : 'unchecked'}
                onPress={() => handleFacilityToggle(facility.key)}
              />
              <Text style={styles.checkboxLabel}>{facility.label}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Distance Filter */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>最大距離: {maxDistance}km</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={100}
            value={maxDistance}
            onValueChange={handleDistanceChange}
            step={1}
            minimumTrackTintColor="#2196F3"
            maximumTrackTintColor="#E0E0E0"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>1km</Text>
            <Text style={styles.sliderLabel}>100km</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Cabinet Count Filter */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>筐体数</Text>
          <SegmentedButtons
            value={cabinetFilter}
            onValueChange={setCabinetFilter}
            buttons={[
              { value: 'all', label: 'すべて' },
              { value: 'few', label: '1-3台' },
              { value: 'medium', label: '4-6台' },
              { value: 'many', label: '7台以上' },
            ]}
            style={styles.segmentedButtons}
          />
        </Card.Content>
      </Card>

      {/* Additional Options */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>その他の条件</Text>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>現在営業中のみ</Text>
            <Switch
              value={openNowOnly}
              onValueChange={setOpenNowOnly}
              color="#2196F3"
            />
          </View>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>お気に入りのみ</Text>
            <Switch
              value={favoritesOnly}
              onValueChange={setFavoritesOnly}
              color="#2196F3"
            />
          </View>
        </Card.Content>
      </Card>

      {/* Sort Options */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>並び順</Text>
          <SegmentedButtons
            value={sortBy}
            onValueChange={setSortBy}
            buttons={[
              { value: 'distance', label: '距離順' },
              { value: 'name', label: '名前順' },
              { value: 'cabinets', label: '筐体数順' },
              { value: 'updated', label: '更新順' },
            ]}
            style={styles.segmentedButtons}
          />
        </Card.Content>
      </Card>

      <Divider style={styles.divider} />

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={handleResetFilters}
          style={styles.button}
        >
          リセット
        </Button>
        <Button
          mode="contained"
          onPress={onClose}
          style={styles.button}
        >
          フィルターを適用 ({getActiveFiltersCount()})
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterBadge: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
  },
  slider: {
    height: 40,
    marginVertical: 8,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#666',
  },
  divider: {
    marginVertical: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  segmentedButtons: {
    marginVertical: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 16,
    flex: 1,
  },
});

export default FilterModal;