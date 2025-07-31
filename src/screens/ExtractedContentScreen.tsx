import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useFileContext} from '../context/FileContext';
import {useTheme} from '../context/ThemeContext';
import {ExtractedFile, ViewMode, SortOption} from '../types';
import {formatFileSize, formatDateRelative, truncateText} from '../utils/helpers';

const {width} = Dimensions.get('window');

const ExtractedContentScreen = ({navigation, route}: any) => {
  const {state} = useFileContext();
  const {theme} = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [selectedFile, setSelectedFile] = useState<ExtractedFile | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const fileId = route?.params?.fileId;

  useEffect(() => {
    if (fileId) {
      const file = state.files.find(f => f.id === fileId);
      if (file) {
        setSelectedFile(file);
      }
    }
  }, [fileId, state.files]);

  const getSortedFiles = () => {
    const files = [...state.files];
    switch (sortBy) {
      case 'name':
        return files.sort((a, b) => a.name.localeCompare(b.name));
      case 'date':
        return files.sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
      case 'size':
        return files.sort((a, b) => b.size - a.size);
      case 'type':
        return files.sort((a, b) => a.type.localeCompare(b.type));
      default:
        return files;
    }
  };

  const handleFileSelect = (file: ExtractedFile) => {
    setSelectedFile(file);
  };

  const handleBackToList = () => {
    setSelectedFile(null);
  };

  const renderFileCard = ({item}: {item: ExtractedFile}) => {
    const isSelected = selectedFile?.id === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.fileCard,
          isSelected && {borderColor: theme.primary, borderWidth: 2}
        ]}
        onPress={() => handleFileSelect(item)}>
        <View style={styles.fileHeader}>
          <View style={styles.fileIcon}>
            <Icon
              name={getFileIcon(item.type)}
              size={24}
              color={getFileColor(item.type)}
            />
          </View>
          <View style={styles.statusIndicator}>
            <Icon
              name={getStatusIcon(item.processingStatus)}
              size={16}
              color={getStatusColor(item.processingStatus, theme)}
            />
          </View>
        </View>
        
        <Text style={styles.fileName} numberOfLines={2}>
          {item.name}
        </Text>
        
        <View style={styles.fileStats}>
          <Text style={styles.statText}>
            {formatFileSize(item.size)}
          </Text>
          <Text style={styles.statText}>
            {formatDateRelative(item.uploadDate)}
          </Text>
        </View>

        {item.extractedContent.summary && (
          <Text style={styles.summary} numberOfLines={3}>
            {item.extractedContent.summary}
          </Text>
        )}

        <View style={styles.contentStats}>
          {item.extractedContent.text && (
            <View style={styles.contentStat}>
              <Icon name="text-fields" size={12} color={theme.textSecondary} />
              <Text style={styles.contentStatText}>
                {item.extractedContent.text.split(' ').length} words
              </Text>
            </View>
          )}
          
          {item.extractedContent.images.length > 0 && (
            <View style={styles.contentStat}>
              <Icon name="image" size={12} color={theme.textSecondary} />
              <Text style={styles.contentStatText}>
                {item.extractedContent.images.length} images
              </Text>
            </View>
          )}
          
          {item.extractedContent.tables.length > 0 && (
            <View style={styles.contentStat}>
              <Icon name="table-chart" size={12} color={theme.textSecondary} />
              <Text style={styles.contentStatText}>
                {item.extractedContent.tables.length} tables
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderGridItem = ({item}: {item: ExtractedFile}) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => handleFileSelect(item)}>
      <View style={styles.gridItemHeader}>
        <Icon
          name={getFileIcon(item.type)}
          size={32}
          color={getFileColor(item.type)}
        />
        <Icon
          name={getStatusIcon(item.processingStatus)}
          size={16}
          color={getStatusColor(item.processingStatus, theme)}
        />
      </View>
      <Text style={styles.gridItemName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.gridItemDate}>
        {formatDateRelative(item.uploadDate)}
      </Text>
    </TouchableOpacity>
  );

  const renderFileContent = () => {
    if (!selectedFile) return null;

    return (
      <ScrollView style={styles.contentView}>
        <View style={styles.contentHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToList}>
            <Icon name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.contentTitle} numberOfLines={1}>
            {selectedFile.name}
          </Text>
          <TouchableOpacity style={styles.moreButton}>
            <Icon name="more-vert" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* File Info */}
        <View style={styles.fileInfoCard}>
          <View style={styles.fileInfoRow}>
            <Text style={styles.fileInfoLabel}>Size:</Text>
            <Text style={styles.fileInfoValue}>
              {formatFileSize(selectedFile.size)}
            </Text>
          </View>
          <View style={styles.fileInfoRow}>
            <Text style={styles.fileInfoLabel}>Type:</Text>
            <Text style={styles.fileInfoValue}>
              {selectedFile.type.toUpperCase()}
            </Text>
          </View>
          <View style={styles.fileInfoRow}>
            <Text style={styles.fileInfoLabel}>Uploaded:</Text>
            <Text style={styles.fileInfoValue}>
              {formatDateRelative(selectedFile.uploadDate)}
            </Text>
          </View>
          <View style={styles.fileInfoRow}>
            <Text style={styles.fileInfoLabel}>Status:</Text>
            <Text style={[
              styles.fileInfoValue,
              {color: getStatusColor(selectedFile.processingStatus, theme)}
            ]}>
              {selectedFile.processingStatus.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Summary */}
        {selectedFile.extractedContent.summary && (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.summaryText}>
                {selectedFile.extractedContent.summary}
              </Text>
            </View>
          </View>
        )}

        {/* Keywords */}
        {selectedFile.extractedContent.keywords && selectedFile.extractedContent.keywords.length > 0 && (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>Keywords</Text>
            <View style={styles.keywordsContainer}>
              {selectedFile.extractedContent.keywords.map((keyword, index) => (
                <View key={index} style={styles.keywordTag}>
                  <Text style={styles.keywordText}>{keyword}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Topics */}
        {selectedFile.extractedContent.topics && selectedFile.extractedContent.topics.length > 0 && (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>Topics</Text>
            <View style={styles.topicsContainer}>
              {selectedFile.extractedContent.topics.map((topic, index) => (
                <View key={index} style={styles.topicTag}>
                  <Text style={styles.topicText}>{topic}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Extracted Text */}
        {selectedFile.extractedContent.text && (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>Extracted Text</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.extractedText}>
                {selectedFile.extractedContent.text}
              </Text>
            </View>
          </View>
        )}

        {/* Images */}
        {selectedFile.extractedContent.images.length > 0 && (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>
              Images ({selectedFile.extractedContent.images.length})
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.imagesContainer}>
                {selectedFile.extractedContent.images.map((image, index) => (
                  <View key={image.id} style={styles.imageCard}>
                    <Image source={{uri: image.uri}} style={styles.imagePreview} />
                    {image.ocrText && (
                      <Text style={styles.imageOcrText} numberOfLines={3}>
                        {image.ocrText}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Tables */}
        {selectedFile.extractedContent.tables.length > 0 && (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>
              Tables ({selectedFile.extractedContent.tables.length})
            </Text>
            {selectedFile.extractedContent.tables.map((table, index) => (
              <View key={table.id} style={styles.tableCard}>
                {table.title && (
                  <Text style={styles.tableTitle}>{table.title}</Text>
                )}
                <ScrollView horizontal>
                  <View style={styles.table}>
                    {/* Headers */}
                    <View style={styles.tableRow}>
                      {table.headers.map((header, headerIndex) => (
                        <Text key={headerIndex} style={styles.tableHeader}>
                          {header}
                        </Text>
                      ))}
                    </View>
                    {/* Rows */}
                    {table.rows.slice(0, 5).map((row, rowIndex) => (
                      <View key={rowIndex} style={styles.tableRow}>
                        {row.map((cell, cellIndex) => (
                          <Text key={cellIndex} style={styles.tableCell}>
                            {cell}
                          </Text>
                        ))}
                      </View>
                    ))}
                    {table.rows.length > 5 && (
                      <Text style={styles.moreRowsText}>
                        +{table.rows.length - 5} more rows
                      </Text>
                    )}
                  </View>
                </ScrollView>
              </View>
            ))}
          </View>
        )}

        {/* Timeline */}
        {selectedFile.extractedContent.timeline && selectedFile.extractedContent.timeline.length > 0 && (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>Timeline</Text>
            <View style={styles.timelineContainer}>
              {selectedFile.extractedContent.timeline.map((event, index) => (
                <View key={event.id} style={styles.timelineEvent}>
                  <View style={styles.timelineDot} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineDate}>
                      {event.date.toLocaleDateString()}
                    </Text>
                    <Text style={styles.timelineTitle}>{event.title}</Text>
                    <Text style={styles.timelineDescription}>
                      {event.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  const styles = createStyles(theme);

  if (selectedFile) {
    return (
      <View style={styles.container}>
        {renderFileContent()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Content Library</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.viewModeButton}
            onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}>
            <Icon
              name={viewMode === 'list' ? 'grid-view' : 'view-list'}
              size={20}
              color={theme.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}>
            <Icon name="filter-list" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filtersTitle}>Sort by:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.sortOptions}>
              {(['date', 'name', 'size', 'type'] as SortOption[]).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.sortOption,
                    sortBy === option && {backgroundColor: theme.primary}
                  ]}
                  onPress={() => setSortBy(option)}>
                  <Text style={[
                    styles.sortOptionText,
                    sortBy === option && {color: 'white'}
                  ]}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Content */}
      {state.files.length > 0 ? (
        <FlatList
          data={getSortedFiles()}
          renderItem={viewMode === 'list' ? renderFileCard : renderGridItem}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Icon name="folder-open" size={64} color={theme.textSecondary} />
          <Text style={styles.emptyStateText}>No files processed yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Upload files to see extracted content here
          </Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => navigation.navigate('Upload')}>
            <Text style={styles.uploadButtonText}>Upload Files</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// Helper functions
const getFileIcon = (fileType: string) => {
  const iconMap: {[key: string]: string} = {
    pdf: 'picture-as-pdf',
    docx: 'description',
    xlsx: 'table-chart',
    pptx: 'slideshow',
    txt: 'text-fields',
    jpg: 'image',
    png: 'image',
    gif: 'gif',
    svg: 'image',
  };
  return iconMap[fileType] || 'insert-drive-file';
};

const getFileColor = (fileType: string) => {
  const colorMap: {[key: string]: string} = {
    pdf: '#FF5722',
    docx: '#2196F3',
    xlsx: '#4CAF50',
    pptx: '#FF9800',
    txt: '#607D8B',
    jpg: '#E91E63',
    png: '#E91E63',
    gif: '#9C27B0',
    svg: '#3F51B5',
  };
  return colorMap[fileType] || '#757575';
};

const getStatusIcon = (status: string) => {
  const iconMap: {[key: string]: string} = {
    pending: 'schedule',
    processing: 'hourglass-empty',
    completed: 'check-circle',
    error: 'error',
  };
  return iconMap[status] || 'help';
};

const getStatusColor = (status: string, theme: any) => {
  const colorMap: {[key: string]: string} = {
    pending: theme.warning,
    processing: theme.info,
    completed: theme.success,
    error: theme.error,
  };
  return colorMap[status] || theme.textSecondary;
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 40,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
    },
    headerActions: {
      flexDirection: 'row',
      gap: 12,
    },
    viewModeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    filterButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    filtersContainer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    filtersTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 12,
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
    listContainer: {
      padding: 20,
    },
    fileCard: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    fileHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    fileIcon: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: theme.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statusIndicator: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    fileName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    fileStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    statText: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    summary: {
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 18,
      marginBottom: 12,
    },
    contentStats: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    contentStat: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    contentStatText: {
      fontSize: 11,
      color: theme.textSecondary,
    },
    gridItem: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      margin: 8,
      alignItems: 'center',
    },
    gridItemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginBottom: 12,
    },
    gridItemName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    gridItemDate: {
      fontSize: 11,
      color: theme.textSecondary,
      textAlign: 'center',
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
    // Content view styles
    contentView: {
      flex: 1,
    },
    contentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
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
      marginRight: 16,
    },
    contentTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    moreButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    fileInfoCard: {
      backgroundColor: theme.surface,
      margin: 20,
      borderRadius: 12,
      padding: 16,
    },
    fileInfoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    fileInfoLabel: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    fileInfoValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
    },
    contentSection: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 12,
    },
    sectionContent: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
    },
    summaryText: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.text,
    },
    keywordsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    keywordTag: {
      backgroundColor: theme.primary,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    keywordText: {
      fontSize: 12,
      color: 'white',
      fontWeight: '500',
    },
    topicsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    topicTag: {
      backgroundColor: theme.secondary,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    topicText: {
      fontSize: 12,
      color: 'white',
      fontWeight: '500',
    },
    extractedText: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.text,
    },
    imagesContainer: {
      flexDirection: 'row',
      gap: 16,
      paddingHorizontal: 4,
    },
    imageCard: {
      width: 150,
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 12,
    },
    imagePreview: {
      width: '100%',
      height: 100,
      borderRadius: 8,
      backgroundColor: theme.border,
      marginBottom: 8,
    },
    imageOcrText: {
      fontSize: 11,
      color: theme.textSecondary,
      lineHeight: 14,
    },
    tableCard: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    tableTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 12,
    },
    table: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      overflow: 'hidden',
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    tableHeader: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.text,
      padding: 8,
      backgroundColor: theme.background,
      minWidth: 100,
      borderRightWidth: 1,
      borderRightColor: theme.border,
    },
    tableCell: {
      fontSize: 12,
      color: theme.text,
      padding: 8,
      minWidth: 100,
      borderRightWidth: 1,
      borderRightColor: theme.border,
    },
    moreRowsText: {
      fontSize: 12,
      color: theme.textSecondary,
      padding: 8,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    timelineContainer: {
      paddingLeft: 16,
    },
    timelineEvent: {
      flexDirection: 'row',
      marginBottom: 20,
    },
    timelineDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.primary,
      marginTop: 4,
      marginRight: 16,
    },
    timelineContent: {
      flex: 1,
    },
    timelineDate: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.primary,
      marginBottom: 4,
    },
    timelineTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    timelineDescription: {
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 18,
    },
  });

export default ExtractedContentScreen;
