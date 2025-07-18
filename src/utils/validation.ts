import { Store, Suggestion, User, BusinessHours } from '@/types';

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validateStore = (store: any): store is Store => {
  if (!store || typeof store !== 'object') {
    throw new ValidationError('Store must be an object');
  }

  if (!store.id || typeof store.id !== 'string') {
    throw new ValidationError('Store ID is required and must be a string', 'id');
  }

  if (!store.name || typeof store.name !== 'string') {
    throw new ValidationError('Store name is required and must be a string', 'name');
  }

  if (!store.address || typeof store.address !== 'string') {
    throw new ValidationError('Store address is required and must be a string', 'address');
  }

  // Validate location
  if (!store.location || typeof store.location !== 'object') {
    throw new ValidationError('Store location is required', 'location');
  }

  if (store.location.type !== 'Point') {
    throw new ValidationError('Location type must be "Point"', 'location.type');
  }

  if (!Array.isArray(store.location.coordinates) || store.location.coordinates.length !== 2) {
    throw new ValidationError('Location coordinates must be an array of 2 numbers', 'location.coordinates');
  }

  const [lng, lat] = store.location.coordinates;
  if (typeof lng !== 'number' || typeof lat !== 'number') {
    throw new ValidationError('Coordinates must be numbers', 'location.coordinates');
  }

  if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
    throw new ValidationError('Invalid coordinates range', 'location.coordinates');
  }

  // Validate business hours
  if (!store.businessHours || typeof store.businessHours !== 'object') {
    throw new ValidationError('Business hours are required', 'businessHours');
  }

  validateBusinessHours(store.businessHours);

  // Validate CHUNITHM info
  if (!store.chunithmInfo || typeof store.chunithmInfo !== 'object') {
    throw new ValidationError('CHUNITHM info is required', 'chunithmInfo');
  }

  if (typeof store.chunithmInfo.cabinets !== 'number' || store.chunithmInfo.cabinets < 0) {
    throw new ValidationError('Cabinet count must be a non-negative number', 'chunithmInfo.cabinets');
  }

  if (!Array.isArray(store.chunithmInfo.versions)) {
    throw new ValidationError('Versions must be an array', 'chunithmInfo.versions');
  }

  if (!Array.isArray(store.chunithmInfo.facilities)) {
    throw new ValidationError('Facilities must be an array', 'chunithmInfo.facilities');
  }

  // Validate optional fields
  if (store.specialNotice && typeof store.specialNotice !== 'string') {
    throw new ValidationError('Special notice must be a string', 'specialNotice');
  }

  if (!Array.isArray(store.photos)) {
    throw new ValidationError('Photos must be an array', 'photos');
  }

  return true;
};

export const validateBusinessHours = (hours: any): hours is BusinessHours => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  for (const day of days) {
    if (!hours[day] || typeof hours[day] !== 'object') {
      throw new ValidationError(`${day} hours are required`, `businessHours.${day}`);
    }

    const dayHours = hours[day];
    if (typeof dayHours.open !== 'string' || typeof dayHours.close !== 'string') {
      throw new ValidationError(`${day} open/close times must be strings`, `businessHours.${day}`);
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(dayHours.open) || !timeRegex.test(dayHours.close)) {
      throw new ValidationError(`${day} times must be in HH:MM format`, `businessHours.${day}`);
    }
  }

  return true;
};

export const validateSuggestion = (suggestion: any): suggestion is Suggestion => {
  if (!suggestion || typeof suggestion !== 'object') {
    throw new ValidationError('Suggestion must be an object');
  }

  if (!suggestion.id || typeof suggestion.id !== 'string') {
    throw new ValidationError('Suggestion ID is required', 'id');
  }

  if (!suggestion.storeId || typeof suggestion.storeId !== 'string') {
    throw new ValidationError('Store ID is required', 'storeId');
  }

  if (!suggestion.field || typeof suggestion.field !== 'string') {
    throw new ValidationError('Field is required', 'field');
  }

  if (suggestion.value === undefined || suggestion.value === null) {
    throw new ValidationError('Value is required', 'value');
  }

  const validStatuses = ['pending', 'approved', 'rejected'];
  if (!validStatuses.includes(suggestion.status)) {
    throw new ValidationError('Invalid status', 'status');
  }

  if (suggestion.comment && typeof suggestion.comment !== 'string') {
    throw new ValidationError('Comment must be a string', 'comment');
  }

  if (suggestion.userId && typeof suggestion.userId !== 'string') {
    throw new ValidationError('User ID must be a string', 'userId');
  }

  if (typeof suggestion.anonymous !== 'boolean') {
    throw new ValidationError('Anonymous must be a boolean', 'anonymous');
  }

  return true;
};

export const validateUser = (user: any): user is User => {
  if (!user || typeof user !== 'object') {
    throw new ValidationError('User must be an object');
  }

  if (!user.id || typeof user.id !== 'string') {
    throw new ValidationError('User ID is required', 'id');
  }

  if (!user.username || typeof user.username !== 'string') {
    throw new ValidationError('Username is required', 'username');
  }

  if (!user.email || typeof user.email !== 'string') {
    throw new ValidationError('Email is required', 'email');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(user.email)) {
    throw new ValidationError('Invalid email format', 'email');
  }

  if (!Array.isArray(user.favorites)) {
    throw new ValidationError('Favorites must be an array', 'favorites');
  }

  if (typeof user.contributions !== 'number' || user.contributions < 0) {
    throw new ValidationError('Contributions must be a non-negative number', 'contributions');
  }

  const validRoles = ['user', 'moderator', 'admin'];
  if (!validRoles.includes(user.role)) {
    throw new ValidationError('Invalid user role', 'role');
  }

  return true;
};

export const sanitizeString = (input: string, maxLength = 255): string => {
  return input.trim().substring(0, maxLength);
};

export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const validateCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

export const validateDistance = (distance: number): boolean => {
  return distance >= 0 && distance <= 50000; // Max 50,000 km
};

export const validateVersionName = (version: string): boolean => {
  const validVersions = [
    'CHUNITHM',
    'CHUNITHM PLUS',
    'CHUNITHM AIR',
    'CHUNITHM AIR PLUS',
    'CHUNITHM STAR',
    'CHUNITHM STAR PLUS',
    'CHUNITHM AMAZON',
    'CHUNITHM AMAZON PLUS',
    'CHUNITHM CRYSTAL',
    'CHUNITHM CRYSTAL PLUS',
    'CHUNITHM PARADISE',
    'CHUNITHM NEW!!',
    'CHUNITHM NEW!! PLUS',
    'CHUNITHM SUN',
    'CHUNITHM SUN PLUS',
  ];
  
  return validVersions.includes(version);
};

export const validateFacilityName = (facility: string): boolean => {
  const validFacilities = [
    'PASELI',
    'TOURNAMENT',
    'LIVE',
    'HEADPHONE',
    'PRIVACY',
    'AIME',
    'IC_CARD',
  ];
  
  return validFacilities.includes(facility);
};