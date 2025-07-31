import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {useTheme} from '../context/ThemeContext';
import {SearchService, SearchOptions, AdvancedSearchCriteria} from '../services/SearchService';
import {SearchResult} from '../types';
import {debounce, highlightText} from '../utils/helpers';
import { useFileContext } from '../context/FileContext';

const SearchScreen = ({navigation}: any) => {
  const {state, setSearchResults} = useFileContext();
  const {theme} = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    includeText: true,
    includeOCR: true,
    includeMetadata: true,
    sortBy: 'relevance',
    maxResults: 50,
    threshold: 0.1,
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchType, setSearchType] = useState<'regular' | 'semantic'>('regular');
  
  const searchService = SearchService.getInstance();

  useEffect(() => {
    // Load recent searches from storage
    // In production, use AsyncStorage
    setRecentSearches(['document analysis', 'meeting notes', 'financial data']);
  }, []);

  const debouncedSearch = debounce(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      let searchResults: SearchResult[];
      
      if (searchType === 'semantic') {
        searchResults = await searchService.semanticSearch(
          searchQuery,
          state.files,
          searchOptions.maxResults
        );
      } else {
        searchResults = await searchService.search(
          searchQuery,
          state.files,
          searchOptions
        );
      }

      setResults(searchResults);
      setSearchResults(searchResults);
      
      // Add to recent searches
      if (!recentSearches.includes(searchQuery)) {
        setRecentSearches([searchQuery, ...recentSearches.slice(0, 9)]);
      }
      
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, 500);

  useEffect(() => {
    debouncedSearch(query);
  }, [query, searchOptions, searchType]);

  const handleAdvancedSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const criteria: AdvancedSearchCriteria = {
        query,
        searchOptions,
      };

      const searchResults = await searchService.advancedSearch(criteria, state.files);
      setResults(searchResults);
      setSearchResults(searchResults);
    } catch (error) {
      console.error('Advanced search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultPress = (result: SearchResult) => {
    // Navigate to the file content
    navigation.navigate('Content', {fileId: result.fileId});
  };

  const renderSearchResult = ({item}: {item: SearchResult}) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => handleResultPress(item)}>
      <View style={styles.resultHeader}>
        <Text style={styles.fileName} numberOfLines={1}>
          {item.fileName}
        </Text>
        <View style={styles.matchInfo}>
          <View style={[styles.matchType, {backgroundColor: getMatchTypeColor(item.matchType)}]}>
            <Text style={styles.matchTypeText}>{item.matchType.toUpperCase()}</Text>
          </View>
          <Text style={styles.relevanceScore}>
            {Math.round(item.relevanceScore * 100)}%
          </Text>
        </View>
      </View>
      
      <Text style={styles.resultContent} numberOfLines={3}>
        {item.content}
      </Text>
      
      {item.context && (
        <Text style={styles.resultContext} numberOfLines={2}>
          Context: {item.context}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderRecentSearch = (search: string) => (
    <TouchableOpacity
      key={search}
      style={styles.recentSearchItem}
      onPress={() => setQuery(search)}>
      <Icon name="history" size={16} color={theme.textSecondary} />
      <Text style={styles.recentSearchText}>{search}</Text>
      <TouchableOpacity
        onPress={() => setRecentSearches(recentSearches.filter(s => s !== search))}>
        <Icon name="close" size={16} color={theme.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const getMatchTypeColor = (matchType: string) => {
    const colors: {[key: string]: string} = {
      text: theme.primary,
      ocr: theme.secondary,
      metadata: theme.success,
    };
    return colors[matchType] || theme.primary;
  };

  const getFacets = () => {
    return searchService.getFacets(state.files);
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
        <TouchableOpacity
          style={styles.filtersButton}
          onPress={() => setShowFilters(!showFilters)}>
          <Icon name="tune" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search in your files..."
            placeholderTextColor={theme.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Icon name="close" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.searchTypes}>
          <TouchableOpacity
            style={[
              styles.searchTypeButton,
              searchType === 'regular' && {backgroundColor: theme.primary}
            ]}
            onPress={() => setSearchType('regular')}>
            <Text style={[
              styles.searchTypeText,
              searchType === 'regular' && {color: 'white'}
            ]}>
              Regular
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.searchTypeButton,
              searchType === 'semantic' && {backgroundColor: theme.secondary}
            ]}
            onPress={() => setSearchType('semantic')}>
            <Text style={[
              styles.searchTypeText,
              searchType === 'semantic' && {color: 'white'}
            ]}>
              AI Search
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filtersTitle}>Search Options</Text>
          
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Include:</Text>
            <View style={styles.checkboxGroup}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setSearchOptions({
                  ...searchOptions,
                  includeText: !searchOptions.includeText
                })}>
                <Icon
                  name={searchOptions.includeText ? 'check-box' : 'check-box-outline-blank'}
                  size={20}
                  color={theme.primary}
                />
                <Text style={styles.checkboxLabel}>Text</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setSearchOptions({
                  ...searchOptions,
                  includeOCR: !searchOptions.includeOCR
                })}>
                <Icon
                  name={searchOptions.includeOCR ? 'check-box' : 'check-box-outline-blank'}
                  size={20}
                  color={theme.primary}
                />
                <Text style={styles.checkboxLabel}>OCR</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setSearchOptions({
                  ...searchOptions,
                  includeMetadata: !searchOptions.includeMetadata
                })}>
                <Icon
                  name={searchOptions.includeMetadata ? 'check-box' : 'check-box-outline-blank'}
                  size={20}
                  color={theme.primary}
                />
                <Text style={styles.checkboxLabel}>Metadata</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Sort by:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.sortOptions}>
                {(['relevance', 'name', 'date'] as const).map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.sortOption,
                      searchOptions.sortBy === option && {backgroundColor: theme.primary}
                    ]}
                    onPress={() => setSearchOptions({
                      ...searchOptions,
                      sortBy: option
                    })}>
                    <Text style={[
                      styles.sortOptionText,
                      searchOptions.sortBy === option && {color: 'white'}
                    ]}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {query.length === 0 ? (
          // Show recent searches and suggestions
          <ScrollView>
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                {recentSearches.map(renderRecentSearch)}
              </View>
            )}
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Search Tips</Text>
              <View style={styles.tipsContainer}>
                <View style={styles.tip}>
                  <Icon name="lightbulb-outline" size={16} color={theme.warning} />
                  <Text style={styles.tipText}>
                    Use quotes for exact phrases: "meeting notes"
                  </Text>
                </View>
                <View style={styles.tip}>
                  <Icon name="lightbulb-outline" size={16} color={theme.warning} />
                  <Text style={styles.tipText}>
                    AI Search understands context and meaning
                  </Text>
                </View>
                <View style={styles.tip}>
                  <Icon name="lightbulb-outline" size={16} color={theme.warning} />
                  <Text style={styles.tipText}>
                    Filter by file type, date, or content source
                  </Text>
                </View>
              </View>
            </View>

            {/* Statistics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Library Stats</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{state.files.length}</Text>
                  <Text style={styles.statLabel}>Files</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>
                    {state.files.reduce((sum, file) => 
                      sum + file.extractedContent.text.split(' ').length, 0
                    )}
                  </Text>
                  <Text style={styles.statLabel}>Words</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>
                    {state.files.reduce((sum, file) => 
                      sum + file.extractedContent.images.length, 0
                    )}
                  </Text>
                  <Text style={styles.statLabel}>Images</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        ) : (
          // Show search results
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                {isSearching ? 'Searching...' : `${results.length} results`}
              </Text>
              {isSearching && <ActivityIndicator size="small" color={theme.primary} />}
            </View>
            
            {results.length > 0 ? (
              <FlatList
                data={results}
                renderItem={renderSearchResult}
                keyExtractor={(item, index) => `${item.fileId}-${index}`}
                showsVerticalScrollIndicator={false}
              />
            ) : !isSearching ? (
              <View style={styles.noResults}>
                <Icon name="search-off" size={64} color={theme.textSecondary} />
                <Text style={styles.noResultsText}>No results found</Text>
                <Text style={styles.noResultsSubtext}>
                  Try different keywords or adjust your filters
                </Text>
              </View>
            ) : null}
          </>
        )}
      </View>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 40,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
    },
    filtersButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchBarContainer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
      marginBottom: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
    },
    searchTypes: {
      flexDirection: 'row',
      gap: 8,
    },
    searchTypeButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    searchTypeText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.text,
    },
    filtersContainer: {
      backgroundColor: theme.surface,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    filtersTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
    },
    filterRow: {
      marginBottom: 16,
    },
    filterLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    checkboxGroup: {
      flexDirection: 'row',
      gap: 16,
    },
    checkbox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    checkboxLabel: {
      fontSize: 14,
      color: theme.text,
    },
    sortOptions: {
      flexDirection: 'row',
      gap: 8,
    },
    sortOption: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
    },
    sortOptionText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.text,
    },
    content: {
      flex: 1,
    },
    section: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
    },
    recentSearchItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      gap: 12,
    },
    recentSearchText: {
      flex: 1,
      fontSize: 14,
      color: theme.text,
    },
    tipsContainer: {
      gap: 12,
    },
    tip: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
    },
    tipText: {
      flex: 1,
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 18,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
    },
    statLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 4,
    },
    resultsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    resultsCount: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
    },
    resultCard: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 20,
      marginBottom: 12,
    },
    resultHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    fileName: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginRight: 12,
    },
    matchInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    matchType: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    matchTypeText: {
      fontSize: 10,
      fontWeight: '600',
      color: 'white',
    },
    relevanceScore: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.primary,
    },
    resultContent: {
      fontSize: 14,
      color: theme.text,
      lineHeight: 18,
      marginBottom: 8,
    },
    resultContext: {
      fontSize: 12,
      color: theme.textSecondary,
      lineHeight: 16,
      fontStyle: 'italic',
    },
    noResults: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    noResultsText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginTop: 16,
      textAlign: 'center',
    },
    noResultsSubtext: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 8,
      textAlign: 'center',
      lineHeight: 20,
    },
  });

export default SearchScreen;
