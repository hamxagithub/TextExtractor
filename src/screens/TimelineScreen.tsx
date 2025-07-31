import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useFileContext} from '../context/FileContext';
import {useTheme} from '../context/ThemeContext';
import {TimelineEvent} from '../types';
import {formatDate} from '../utils/helpers';

const TimelineScreen = ({navigation}: any) => {
  const {state} = useFileContext();
  const {theme} = useTheme();
  const [allEvents, setAllEvents] = useState<TimelineEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<TimelineEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');

  useEffect(() => {
    // Collect all timeline events from all files
    const events: TimelineEvent[] = [];
    
    state.files.forEach(file => {
      if (file.extractedContent.timeline) {
        file.extractedContent.timeline.forEach(event => {
          events.push({
            ...event,
            source: file.name, // Override source with file name
          });
        });
      }
    });

    // Sort events by date
    const sortedEvents = events.sort((a, b) => a.date.getTime() - b.date.getTime());
    setAllEvents(sortedEvents);
    setFilteredEvents(sortedEvents);
  }, [state.files]);

  useEffect(() => {
    // Filter events by category
    if (selectedCategory === 'all') {
      setFilteredEvents(allEvents);
    } else {
      setFilteredEvents(allEvents.filter(event => 
        event.category?.toLowerCase() === selectedCategory.toLowerCase()
      ));
    }
  }, [selectedCategory, allEvents]);

  const getUniqueCategories = () => {
    const categories = new Set<string>();
    allEvents.forEach(event => {
      if (event.category) {
        categories.add(event.category);
      }
    });
    return Array.from(categories);
  };

  const groupEventsByYear = () => {
    const groups: {[year: string]: TimelineEvent[]} = {};
    
    filteredEvents.forEach(event => {
      const year = event.date.getFullYear().toString();
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(event);
    });

    return Object.entries(groups).sort(([a], [b]) => parseInt(b) - parseInt(a));
  };

  const renderTimelineEvent = (event: TimelineEvent, index: number) => (
    <View key={event.id} style={styles.timelineEventContainer}>
      <View style={styles.timelineLeft}>
        <View style={[styles.timelineDot, {backgroundColor: getCategoryColor(event.category)}]} />
        {index < filteredEvents.length - 1 && <View style={styles.timelineLine} />}
      </View>
      
      <View style={styles.timelineRight}>
        <View style={styles.eventCard}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventDate}>
              {formatDate(event.date)}
            </Text>
            {event.category && (
              <View style={[styles.categoryBadge, {backgroundColor: getCategoryColor(event.category)}]}>
                <Text style={styles.categoryText}>{event.category}</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDescription}>{event.description}</Text>
          
          <View style={styles.eventFooter}>
            <View style={styles.sourceInfo}>
              <Icon name="source" size={14} color={theme.textSecondary} />
              <Text style={styles.sourceText}>{event.source}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderListEvent = ({item}: {item: TimelineEvent}) => (
    <TouchableOpacity style={styles.listEventCard}>
      <View style={styles.listEventHeader}>
        <Text style={styles.listEventDate}>
          {formatDate(item.date)}
        </Text>
        {item.category && (
          <View style={[styles.categoryBadge, {backgroundColor: getCategoryColor(item.category)}]}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.listEventTitle}>{item.title}</Text>
      <Text style={styles.listEventDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <Text style={styles.listEventSource}>From: {item.source}</Text>
    </TouchableOpacity>
  );

  const renderYearGroup = ([year, events]: [string, TimelineEvent[]]) => (
    <View key={year} style={styles.yearGroup}>
      <View style={styles.yearHeader}>
        <Text style={styles.yearText}>{year}</Text>
        <Text style={styles.yearCount}>({events.length} events)</Text>
      </View>
      
      {events.map((event, index) => renderTimelineEvent(event, index))}
    </View>
  );

  const getCategoryColor = (category?: string) => {
    const colors: {[key: string]: string} = {
      'General': theme.primary,
      'Business': theme.success,
      'Technology': theme.info,
      'Healthcare': theme.warning,
      'Education': theme.secondary,
    };
    return colors[category || 'General'] || theme.primary;
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
        <Text style={styles.headerTitle}>Timeline</Text>
        <TouchableOpacity
          style={styles.viewToggle}
          onPress={() => setViewMode(viewMode === 'timeline' ? 'list' : 'timeline')}>
          <Icon
            name={viewMode === 'timeline' ? 'view-list' : 'timeline'}
            size={24}
            color={theme.text}
          />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{allEvents.length}</Text>
          <Text style={styles.statLabel}>Total Events</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{getUniqueCategories().length}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{state.files.length}</Text>
          <Text style={styles.statLabel}>Sources</Text>
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Filter by category:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoryFilters}>
            <TouchableOpacity
              style={[
                styles.categoryFilter,
                selectedCategory === 'all' && {backgroundColor: theme.primary}
              ]}
              onPress={() => setSelectedCategory('all')}>
              <Text style={[
                styles.categoryFilterText,
                selectedCategory === 'all' && {color: 'white'}
              ]}>
                All
              </Text>
            </TouchableOpacity>
            
            {getUniqueCategories().map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryFilter,
                  selectedCategory === category && {backgroundColor: getCategoryColor(category)}
                ]}
                onPress={() => setSelectedCategory(category)}>
                <Text style={[
                  styles.categoryFilterText,
                  selectedCategory === category && {color: 'white'}
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Content */}
      {filteredEvents.length > 0 ? (
        viewMode === 'timeline' ? (
          <ScrollView 
            style={styles.timelineContainer} 
            showsVerticalScrollIndicator={false}>
            {groupEventsByYear().map(renderYearGroup)}
          </ScrollView>
        ) : (
          <FlatList
            data={filteredEvents}
            renderItem={renderListEvent}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : (
        <View style={styles.emptyState}>
          <Icon name="timeline" size={64} color={theme.textSecondary} />
          <Text style={styles.emptyStateText}>No timeline events found</Text>
          <Text style={styles.emptyStateSubtext}>
            {allEvents.length === 0 
              ? 'Upload files with dates to generate timeline events'
              : 'No events match the selected category'
            }
          </Text>
          {allEvents.length === 0 && (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => navigation.navigate('Upload')}>
              <Text style={styles.uploadButtonText}>Upload Files</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Legend */}
      {filteredEvents.length > 0 && (
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Legend:</Text>
          <View style={styles.legendItems}>
            {getUniqueCategories().map(category => (
              <View key={category} style={styles.legendItem}>
                <View style={[styles.legendDot, {backgroundColor: getCategoryColor(category)}]} />
                <Text style={styles.legendText}>{category}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
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
    viewToggle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 16,
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
    },
    statLabel: {
      fontSize: 11,
      color: theme.textSecondary,
      marginTop: 2,
    },
    filterContainer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    filterTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 12,
    },
    categoryFilters: {
      flexDirection: 'row',
      gap: 8,
    },
    categoryFilter: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
    },
    categoryFilterText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.text,
    },
    timelineContainer: {
      flex: 1,
      paddingHorizontal: 20,
    },
    yearGroup: {
      marginVertical: 16,
    },
    yearHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingBottom: 8,
      borderBottomWidth: 2,
      borderBottomColor: theme.border,
    },
    yearText: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.text,
    },
    yearCount: {
      fontSize: 14,
      color: theme.textSecondary,
      marginLeft: 8,
    },
    timelineEventContainer: {
      flexDirection: 'row',
      marginBottom: 20,
    },
    timelineLeft: {
      alignItems: 'center',
      marginRight: 16,
    },
    timelineDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      zIndex: 1,
    },
    timelineLine: {
      width: 2,
      flex: 1,
      backgroundColor: theme.border,
      marginTop: 8,
    },
    timelineRight: {
      flex: 1,
    },
    eventCard: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    eventHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    eventDate: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.primary,
    },
    categoryBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    categoryText: {
      fontSize: 10,
      fontWeight: '600',
      color: 'white',
    },
    eventTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    eventDescription: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    eventFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sourceInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    sourceText: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    listContainer: {
      padding: 20,
    },
    listEventCard: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    listEventHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    listEventDate: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.primary,
    },
    listEventTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 6,
    },
    listEventDescription: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 18,
      marginBottom: 8,
    },
    listEventSource: {
      fontSize: 11,
      color: theme.textSecondary,
      fontStyle: 'italic',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyStateText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginTop: 16,
      textAlign: 'center',
    },
    emptyStateSubtext: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 8,
      textAlign: 'center',
      lineHeight: 20,
    },
    uploadButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      marginTop: 24,
    },
    uploadButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
    },
    legend: {
      backgroundColor: theme.surface,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    legendTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    legendItems: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    legendText: {
      fontSize: 12,
      color: theme.textSecondary,
    },
  });

export default TimelineScreen;
