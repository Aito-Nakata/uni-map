import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Searchbar, Chip } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setSearchKeyword } from '@/store/slices/filtersSlice';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "店舗名・地域名で検索" 
}) => {
  const dispatch = useAppDispatch();
  const { searchKeyword } = useAppSelector(state => state.filters);
  const [localQuery, setLocalQuery] = useState(searchKeyword);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      // In a real app, this would load from AsyncStorage
      const history = ['渋谷', '新宿', 'ゲームセンター', '大阪']; // Mock data
      setSearchHistory(history);
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  };

  const saveSearchQuery = async (query: string) => {
    if (query.trim().length === 0) return;
    
    try {
      const updatedHistory = [
        query,
        ...searchHistory.filter(item => item !== query)
      ].slice(0, 10); // Keep only 10 recent searches
      
      setSearchHistory(updatedHistory);
      // In a real app, this would save to AsyncStorage
    } catch (error) {
      console.error('Failed to save search query:', error);
    }
  };

  const handleChangeText = (query: string) => {
    setLocalQuery(query);
    dispatch(setSearchKeyword(query));
    
    if (onSearch) {
      onSearch(query);
    }
    
    setShowSuggestions(query.length > 0 && searchHistory.length > 0);
  };

  const handleSubmit = () => {
    if (localQuery.trim()) {
      saveSearchQuery(localQuery.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setLocalQuery(suggestion);
    dispatch(setSearchKeyword(suggestion));
    setShowSuggestions(false);
    
    if (onSearch) {
      onSearch(suggestion);
    }
    
    saveSearchQuery(suggestion);
  };

  const clearSearch = () => {
    setLocalQuery('');
    dispatch(setSearchKeyword(''));
    setShowSuggestions(false);
    
    if (onSearch) {
      onSearch('');
    }
  };

  const getFilteredSuggestions = () => {
    if (!localQuery || localQuery.length === 0) return [];
    
    return searchHistory.filter(item => 
      item.toLowerCase().includes(localQuery.toLowerCase()) &&
      item.toLowerCase() !== localQuery.toLowerCase()
    ).slice(0, 5);
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder={placeholder}
        onChangeText={handleChangeText}
        value={localQuery}
        onSubmitEditing={handleSubmit}
        onFocus={() => setShowSuggestions(localQuery.length > 0)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
        icon="search"
        clearIcon="close"
        onClearIconPress={clearSearch}
        elevation={2}
      />
      
      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          {getFilteredSuggestions().map((suggestion, index) => (
            <Chip
              key={index}
              mode="outlined"
              onPress={() => handleSuggestionPress(suggestion)}
              style={styles.suggestionChip}
              textStyle={styles.suggestionText}
              icon="history"
            >
              {suggestion}
            </Chip>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
  },
  searchInput: {
    fontSize: 16,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    marginBottom: 4,
  },
  suggestionText: {
    fontSize: 14,
  },
});

export default SearchBar;