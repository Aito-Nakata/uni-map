import { 
  validateStore, 
  validateSuggestion, 
  validateCoordinates, 
  validateVersionName,
  validateFacilityName,
  ValidationError,
  sanitizeString,
  sanitizeHtml
} from '../validation';
import { Store, Suggestion } from '@/types';

describe('Validation Utils', () => {
  describe('validateStore', () => {
    const validStore: Store = {
      id: 'store-1',
      name: 'テストゲームセンター',
      address: '東京都渋谷区1-1-1',
      location: {
        type: 'Point',
        coordinates: [139.7, 35.7]
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
        cabinets: 4,
        versions: ['CHUNITHM SUN PLUS'],
        facilities: ['PASELI', 'AIME']
      },
      lastUpdated: new Date(),
      photos: []
    };

    it('should return true for valid store', () => {
      expect(validateStore(validStore)).toBe(true);
    });

    it('should throw error for empty name', () => {
      const invalidStore = { ...validStore, name: '' };
      expect(() => validateStore(invalidStore)).toThrow(ValidationError);
    });

    it('should throw error for missing name', () => {
      const invalidStore = { ...validStore, name: undefined };
      expect(() => validateStore(invalidStore)).toThrow('Store name is required and must be a string');
    });

    it('should throw error for invalid coordinates', () => {
      const invalidStore = { 
        ...validStore, 
        location: { type: 'Point', coordinates: [200, 100] }
      };
      expect(() => validateStore(invalidStore)).toThrow('Invalid coordinates range');
    });

    it('should throw error for invalid location type', () => {
      const invalidStore = { 
        ...validStore, 
        location: { type: 'Polygon', coordinates: [139.7, 35.7] }
      };
      expect(() => validateStore(invalidStore)).toThrow('Location type must be "Point"');
    });

    it('should throw error for invalid cabinet count', () => {
      const invalidStore = { 
        ...validStore, 
        chunithmInfo: { ...validStore.chunithmInfo, cabinets: -1 }
      };
      expect(() => validateStore(invalidStore)).toThrow('Cabinet count must be a non-negative number');
    });

    it('should throw error for invalid versions type', () => {
      const invalidStore = { 
        ...validStore, 
        chunithmInfo: { ...validStore.chunithmInfo, versions: 'not an array' }
      };
      expect(() => validateStore(invalidStore)).toThrow('Versions must be an array');
    });
  });

  describe('validateSuggestion', () => {
    const validSuggestion: Suggestion = {
      id: 'suggestion-1',
      storeId: 'store-1',
      field: 'name',
      value: '新しい店舗名',
      status: 'pending',
      anonymous: false,
      createdAt: new Date()
    };

    it('should return true for valid suggestion', () => {
      expect(validateSuggestion(validSuggestion)).toBe(true);
    });

    it('should throw error for empty field', () => {
      const invalidSuggestion = { ...validSuggestion, field: '' };
      expect(() => validateSuggestion(invalidSuggestion)).toThrow('Field is required');
    });

    it('should throw error for missing value', () => {
      const invalidSuggestion = { ...validSuggestion, value: undefined };
      expect(() => validateSuggestion(invalidSuggestion)).toThrow('Value is required');
    });

    it('should throw error for invalid status', () => {
      const invalidSuggestion = { 
        ...validSuggestion, 
        status: 'invalid-status' 
      };
      expect(() => validateSuggestion(invalidSuggestion)).toThrow('Invalid status');
    });

    it('should throw error for non-boolean anonymous', () => {
      const invalidSuggestion = { 
        ...validSuggestion, 
        anonymous: 'true' 
      };
      expect(() => validateSuggestion(invalidSuggestion)).toThrow('Anonymous must be a boolean');
    });
  });

  describe('validateCoordinates', () => {
    it('should return true for valid coordinates', () => {
      expect(validateCoordinates(35.7, 139.7)).toBe(true);
    });

    it('should return false for invalid latitude (too high)', () => {
      expect(validateCoordinates(91, 139.7)).toBe(false);
    });

    it('should return false for invalid latitude (too low)', () => {
      expect(validateCoordinates(-91, 139.7)).toBe(false);
    });

    it('should return false for invalid longitude (too high)', () => {
      expect(validateCoordinates(35.7, 181)).toBe(false);
    });

    it('should return false for invalid longitude (too low)', () => {
      expect(validateCoordinates(35.7, -181)).toBe(false);
    });

    it('should return true for edge cases', () => {
      expect(validateCoordinates(90, 180)).toBe(true);
      expect(validateCoordinates(-90, -180)).toBe(true);
    });
  });

  describe('validateVersionName', () => {
    it('should return true for valid version', () => {
      expect(validateVersionName('CHUNITHM SUN PLUS')).toBe(true);
    });

    it('should return false for invalid version', () => {
      expect(validateVersionName('CHUNITHM INVALID')).toBe(false);
    });
  });

  describe('validateFacilityName', () => {
    it('should return true for valid facility', () => {
      expect(validateFacilityName('PASELI')).toBe(true);
    });

    it('should return false for invalid facility', () => {
      expect(validateFacilityName('INVALID_FACILITY')).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should trim and limit string length', () => {
      expect(sanitizeString('  test  ', 3)).toBe('tes');
    });

    it('should handle empty string', () => {
      expect(sanitizeString('')).toBe('');
    });
  });

  describe('sanitizeHtml', () => {
    it('should escape HTML characters', () => {
      expect(sanitizeHtml('<script>alert("test")</script>')).toBe('&lt;script&gt;alert(&quot;test&quot;)&lt;&#x2F;script&gt;');
    });

    it('should handle regular text', () => {
      expect(sanitizeHtml('Hello World')).toBe('Hello World');
    });
  });
});