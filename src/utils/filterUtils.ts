import { Store, FilterState } from '@/types';

interface ExtendedFilterState extends FilterState {
  cabinetFilter: 'all' | 'few' | 'medium' | 'many';
  openNowOnly: boolean;
  favoritesOnly: boolean;
  sortBy: 'distance' | 'name' | 'cabinets' | 'updated';
  showClosed: boolean;
}

export const filterStores = (stores: Store[], filters: ExtendedFilterState, userFavorites: string[] = []): Store[] => {
  let filteredStores = [...stores];

  // Version filter
  if (filters.versions.length > 0) {
    filteredStores = filteredStores.filter(store =>
      store.chunithmInfo.versions.some(version => filters.versions.includes(version))
    );
  }

  // Facilities filter
  if (filters.facilities.length > 0) {
    filteredStores = filteredStores.filter(store =>
      store.chunithmInfo.facilities.some(facility => filters.facilities.includes(facility))
    );
  }

  // Distance filter
  if (filters.maxDistance > 0) {
    filteredStores = filteredStores.filter(store =>
      !store.distance || store.distance <= filters.maxDistance
    );
  }

  // Search keyword filter
  if (filters.searchKeyword.trim().length > 0) {
    const keyword = filters.searchKeyword.toLowerCase().trim();
    filteredStores = filteredStores.filter(store =>
      store.name.toLowerCase().includes(keyword) ||
      store.address.toLowerCase().includes(keyword) ||
      store.chunithmInfo.versions.some(version => version.toLowerCase().includes(keyword)) ||
      store.chunithmInfo.facilities.some(facility => facility.toLowerCase().includes(keyword))
    );
  }

  // Cabinet count filter
  if (filters.cabinetFilter !== 'all') {
    filteredStores = filteredStores.filter(store => {
      const cabinets = store.chunithmInfo.cabinets;
      switch (filters.cabinetFilter) {
        case 'few':
          return cabinets >= 1 && cabinets <= 3;
        case 'medium':
          return cabinets >= 4 && cabinets <= 6;
        case 'many':
          return cabinets >= 7;
        default:
          return true;
      }
    });
  }

  // Open now filter
  if (filters.openNowOnly) {
    filteredStores = filteredStores.filter(store => isStoreOpenNow(store));
  }

  // Favorites only filter
  if (filters.favoritesOnly) {
    filteredStores = filteredStores.filter(store => userFavorites.includes(store.id));
  }

  // Apply sorting
  filteredStores = sortStores(filteredStores, filters.sortBy);

  return filteredStores;
};

export const sortStores = (stores: Store[], sortBy: 'distance' | 'name' | 'cabinets' | 'updated'): Store[] => {
  return [...stores].sort((a, b) => {
    switch (sortBy) {
      case 'distance':
        const distanceA = a.distance || 9999;
        const distanceB = b.distance || 9999;
        return distanceA - distanceB;
      
      case 'name':
        return a.name.localeCompare(b.name, 'ja');
      
      case 'cabinets':
        return b.chunithmInfo.cabinets - a.chunithmInfo.cabinets; // Descending order
      
      case 'updated':
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(); // Most recent first
      
      default:
        return 0;
    }
  });
};

export const isStoreOpenNow = (store: Store): boolean => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentTime = now.getHours() * 100 + now.getMinutes(); // HHMM format

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[currentDay] as keyof typeof store.businessHours;
  
  const todayHours = store.businessHours[dayName];
  
  if (!todayHours) return false;

  const openTime = parseTimeString(todayHours.open);
  const closeTime = parseTimeString(todayHours.close);

  // Handle cases where close time is past midnight (e.g., 25:00 = 1:00 AM next day)
  if (closeTime >= 2400) {
    // If current time is before midnight, check if it's after opening time
    if (currentTime >= openTime) return true;
    // If current time is after midnight, check if it's before adjusted closing time
    if (currentTime <= (closeTime - 2400)) return true;
    return false;
  }

  // Normal case: both open and close times are on the same day
  return currentTime >= openTime && currentTime <= closeTime;
};

const parseTimeString = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 100 + minutes;
};

export const getFilterSummary = (filters: ExtendedFilterState): string => {
  const activeFilters: string[] = [];

  if (filters.versions.length > 0) {
    activeFilters.push(`バージョン: ${filters.versions.length}個`);
  }

  if (filters.facilities.length > 0) {
    activeFilters.push(`設備: ${filters.facilities.length}個`);
  }

  if (filters.cabinetFilter !== 'all') {
    const cabinetLabels = {
      few: '1-3台',
      medium: '4-6台',
      many: '7台以上'
    };
    activeFilters.push(`筐体数: ${cabinetLabels[filters.cabinetFilter]}`);
  }

  if (filters.maxDistance < 50) {
    activeFilters.push(`距離: ${filters.maxDistance}km以内`);
  }

  if (filters.openNowOnly) {
    activeFilters.push('営業中のみ');
  }

  if (filters.favoritesOnly) {
    activeFilters.push('お気に入りのみ');
  }

  if (filters.searchKeyword.trim()) {
    activeFilters.push(`検索: "${filters.searchKeyword}"`);
  }

  return activeFilters.length > 0 ? activeFilters.join(', ') : 'フィルターなし';
};

export const getStoreMatchScore = (store: Store, searchKeyword: string): number => {
  if (!searchKeyword.trim()) return 1;

  const keyword = searchKeyword.toLowerCase().trim();
  let score = 0;

  // Name match (highest priority)
  if (store.name.toLowerCase().includes(keyword)) {
    score += store.name.toLowerCase().indexOf(keyword) === 0 ? 100 : 80;
  }

  // Address match
  if (store.address.toLowerCase().includes(keyword)) {
    score += 60;
  }

  // Version match
  if (store.chunithmInfo.versions.some(v => v.toLowerCase().includes(keyword))) {
    score += 40;
  }

  // Facility match
  if (store.chunithmInfo.facilities.some(f => f.toLowerCase().includes(keyword))) {
    score += 30;
  }

  return score;
};

// Fuzzy search implementation for better search experience
export const fuzzySearch = (stores: Store[], query: string): Store[] => {
  if (!query.trim()) return stores;

  const searchResults = stores.map(store => ({
    store,
    score: getStoreMatchScore(store, query)
  }));

  return searchResults
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(result => result.store);
};