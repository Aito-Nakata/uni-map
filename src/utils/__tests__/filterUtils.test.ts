import { filterStoresByKeyword, filterStoresByVersions, filterStoresByFacilities, calculateDistance } from '../filterUtils';
import { Store } from '@/types';

const mockStores: Store[] = [
  {
    id: 'store-1',
    name: 'ゲームセンター アキバ',
    address: '東京都千代田区秋葉原1-1-1',
    location: {
      type: 'Point',
      coordinates: [139.7737, 35.7021] // Akihabara coordinates
    },
    businessHours: {
      monday: { open: '10:00', close: '22:00' },
      tuesday: { open: '10:00', close: '22:00' },
      wednesday: { open: '10:00', close: '22:00' },
      thursday: { open: '10:00', close: '22:00' },
      friday: { open: '10:00', close: '22:00' },
      saturday: { open: '10:00', close: '24:00' },
      sunday: { open: '10:00', close: '24:00' },
    },
    chunithmInfo: {
      cabinets: 6,
      versions: ['CHUNITHM SUN PLUS', 'CHUNITHM SUN'],
      facilities: ['PASELI', 'AIME', 'TOURNAMENT']
    },
    lastUpdated: new Date(),
    photos: []
  },
  {
    id: 'store-2',
    name: 'ハローワールド 渋谷店',
    address: '東京都渋谷区渋谷2-2-2',
    location: {
      type: 'Point',
      coordinates: [139.7016, 35.6598] // Shibuya coordinates
    },
    businessHours: {
      monday: { open: '11:00', close: '23:00' },
      tuesday: { open: '11:00', close: '23:00' },
      wednesday: { open: '11:00', close: '23:00' },
      thursday: { open: '11:00', close: '23:00' },
      friday: { open: '11:00', close: '24:00' },
      saturday: { open: '10:00', close: '24:00' },
      sunday: { open: '10:00', close: '23:00' },
    },
    chunithmInfo: {
      cabinets: 4,
      versions: ['CHUNITHM SUN PLUS'],
      facilities: ['PASELI', 'HEADPHONE']
    },
    lastUpdated: new Date(),
    photos: []
  },
  {
    id: 'store-3',
    name: 'プレイランド 新宿',
    address: '東京都新宿区新宿3-3-3',
    location: {
      type: 'Point',
      coordinates: [139.7043, 35.6896] // Shinjuku coordinates
    },
    businessHours: {
      monday: { open: '10:00', close: '22:00' },
      tuesday: { open: '10:00', close: '22:00' },
      wednesday: { open: '10:00', close: '22:00' },
      thursday: { open: '10:00', close: '22:00' },
      friday: { open: '10:00', close: '24:00' },
      saturday: { open: '09:00', close: '24:00' },
      sunday: { open: '09:00', close: '22:00' },
    },
    chunithmInfo: {
      cabinets: 8,
      versions: ['CHUNITHM SUN', 'CHUNITHM PARADISE'],
      facilities: ['AIME', 'LIVE', 'PRIVACY']
    },
    lastUpdated: new Date(),
    photos: []
  }
];

describe('filterUtils', () => {
  describe('filterStoresByKeyword', () => {
    it('should filter stores by name', () => {
      const result = filterStoresByKeyword(mockStores, 'アキバ');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('store-1');
    });

    it('should filter stores by address', () => {
      const result = filterStoresByKeyword(mockStores, '渋谷');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('store-2');
    });

    it('should be case insensitive', () => {
      const result = filterStoresByKeyword(mockStores, 'あきば');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('store-1');
    });

    it('should return all stores for empty keyword', () => {
      const result = filterStoresByKeyword(mockStores, '');
      expect(result).toHaveLength(3);
    });

    it('should return empty array for non-matching keyword', () => {
      const result = filterStoresByKeyword(mockStores, '存在しない店舗');
      expect(result).toHaveLength(0);
    });

    it('should handle partial matches', () => {
      const result = filterStoresByKeyword(mockStores, 'ゲーム');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('store-1');
    });
  });

  describe('filterStoresByVersions', () => {
    it('should filter stores by single version', () => {
      const result = filterStoresByVersions(mockStores, ['CHUNITHM SUN PLUS']);
      expect(result).toHaveLength(2);
      expect(result.map(s => s.id)).toContain('store-1');
      expect(result.map(s => s.id)).toContain('store-2');
    });

    it('should filter stores by multiple versions (OR logic)', () => {
      const result = filterStoresByVersions(mockStores, ['CHUNITHM SUN', 'CHUNITHM PARADISE']);
      expect(result).toHaveLength(2);
      expect(result.map(s => s.id)).toContain('store-1');
      expect(result.map(s => s.id)).toContain('store-3');
    });

    it('should return all stores for empty versions array', () => {
      const result = filterStoresByVersions(mockStores, []);
      expect(result).toHaveLength(3);
    });

    it('should return empty array for non-existing version', () => {
      const result = filterStoresByVersions(mockStores, ['CHUNITHM NONEXISTENT']);
      expect(result).toHaveLength(0);
    });
  });

  describe('filterStoresByFacilities', () => {
    it('should filter stores by single facility', () => {
      const result = filterStoresByFacilities(mockStores, ['TOURNAMENT']);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('store-1');
    });

    it('should filter stores by multiple facilities (OR logic)', () => {
      const result = filterStoresByFacilities(mockStores, ['HEADPHONE', 'LIVE']);
      expect(result).toHaveLength(2);
      expect(result.map(s => s.id)).toContain('store-2');
      expect(result.map(s => s.id)).toContain('store-3');
    });

    it('should return all stores for empty facilities array', () => {
      const result = filterStoresByFacilities(mockStores, []);
      expect(result).toHaveLength(3);
    });

    it('should filter stores that have PASELI', () => {
      const result = filterStoresByFacilities(mockStores, ['PASELI']);
      expect(result).toHaveLength(2);
      expect(result.map(s => s.id)).toContain('store-1');
      expect(result.map(s => s.id)).toContain('store-2');
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two points correctly', () => {
      // Distance between Akihabara and Shibuya (approximately 5.5km)
      const distance = calculateDistance(
        35.7021, 139.7737, // Akihabara
        35.6598, 139.7016  // Shibuya
      );
      
      expect(distance).toBeGreaterThan(5);
      expect(distance).toBeLessThan(7);
    });

    it('should return 0 for same coordinates', () => {
      const distance = calculateDistance(35.7021, 139.7737, 35.7021, 139.7737);
      expect(distance).toBe(0);
    });

    it('should handle negative coordinates', () => {
      const distance = calculateDistance(-35.7021, -139.7737, -35.6598, -139.7016);
      expect(distance).toBeGreaterThan(0);
    });

    it('should calculate long distances correctly', () => {
      // Distance between Tokyo and New York (approximately 10,800km)
      const distance = calculateDistance(
        35.6762, 139.6503, // Tokyo
        40.7128, -74.0060  // New York
      );
      
      expect(distance).toBeGreaterThan(10000);
      expect(distance).toBeLessThan(12000);
    });
  });
});