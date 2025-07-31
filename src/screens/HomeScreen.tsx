import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useFileContext} from '../context/FileContext';
import {useTheme} from '../context/ThemeContext';
import {formatFileSize, formatDateRelative} from '../utils/helpers';

const {width} = Dimensions.get('window');

const HomeScreen = ({navigation}: any) => {
  const {state} = useFileContext();
  const {theme} = useTheme();
  const [recentFiles, setRecentFiles] = useState(state.files.slice(0, 5));

  useEffect(() => {
    // Update recent files when state changes
    const sorted = [...state.files]
      .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime())
      .slice(0, 5);
    setRecentFiles(sorted);
  }, [state.files]);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'upload':
        navigation.navigate('Upload');
        break;
      case 'camera':
        navigation.navigate('Upload', {openCamera: true});
        break;
      case 'search':
        navigation.navigate('Search');
        break;
      case 'timeline':
        navigation.navigate('Timeline');
        break;
    }
  };

  const styles = createStyles(theme);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.appTitle}>TextExtractor</Text>
          <Text style={styles.subtitle}>
            Universal file processing & content analysis
          </Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}>
          <Icon name="settings" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsCard}>
          <Icon name="folder" size={32} color={theme.primary} />
          <Text style={styles.statsNumber}>{state.processingStats.totalFiles}</Text>
          <Text style={styles.statsLabel}>Total Files</Text>
        </View>
        <View style={styles.statsCard}>
          <Icon name="description" size={32} color={theme.success} />
          <Text style={styles.statsNumber}>{state.processingStats.processedFiles}</Text>
          <Text style={styles.statsLabel}>Processed</Text>
        </View>
        <View style={styles.statsCard}>
          <Icon name="image" size={32} color={theme.warning} />
          <Text style={styles.statsNumber}>{state.processingStats.totalImages}</Text>
          <Text style={styles.statsLabel}>Images</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={[styles.quickActionCard, {backgroundColor: theme.primary}]}
            onPress={() => handleQuickAction('upload')}>
            <Icon name="cloud-upload" size={32} color="white" />
            <Text style={styles.quickActionText}>Upload Files</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickActionCard, {backgroundColor: theme.secondary}]}
            onPress={() => handleQuickAction('camera')}>
            <Icon name="camera-alt" size={32} color="white" />
            <Text style={styles.quickActionText}>Take Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickActionCard, {backgroundColor: theme.info}]}
            onPress={() => handleQuickAction('search')}>
            <Icon name="search" size={32} color="white" />
            <Text style={styles.quickActionText}>Search</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickActionCard, {backgroundColor: theme.success}]}
            onPress={() => handleQuickAction('timeline')}>
            <Icon name="timeline" size={32} color="white" />
            <Text style={styles.quickActionText}>Timeline</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Files */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Files</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Content')}>
            <Text style={[styles.seeAllText, {color: theme.primary}]}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {recentFiles.length > 0 ? (
          recentFiles.map((file) => (
            <TouchableOpacity
              key={file.id}
              style={styles.fileCard}
              onPress={() => navigation.navigate('Content', {fileId: file.id})}>
              <View style={styles.fileIcon}>
                <Icon
                  name={getFileIcon(file.type)}
                  size={24}
                  color={theme.primary}
                />
              </View>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {file.name}
                </Text>
                <Text style={styles.fileDetails}>
                  {formatFileSize(file.size)} • {formatDateRelative(file.uploadDate)}
                </Text>
                <Text style={styles.fileStatus}>
                  Status: {file.processingStatus}
                </Text>
              </View>
              <View style={styles.fileActions}>
                <Icon name="more-vert" size={20} color={theme.textSecondary} />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="folder-open" size={64} color={theme.textSecondary} />
            <Text style={styles.emptyStateText}>No files yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Upload your first file to get started
            </Text>
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={() => handleQuickAction('upload')}>
              <Text style={styles.getStartedButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Features Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.featuresGrid}>
          <View style={styles.featureCard}>
            <Icon name="auto-fix-high" size={28} color={theme.primary} />
            <Text style={styles.featureTitle}>OCR Technology</Text>
            <Text style={styles.featureDescription}>
              Extract text from images and scanned documents
            </Text>
          </View>
          
          <View style={styles.featureCard}>
            <Icon name="summarize" size={28} color={theme.secondary} />
            <Text style={styles.featureTitle}>AI Summarization</Text>
            <Text style={styles.featureDescription}>
              Generate summaries and extract key insights
            </Text>
          </View>
          
          <View style={styles.featureCard}>
            <Icon name="timeline" size={28} color={theme.success} />
            <Text style={styles.featureTitle}>Timeline View</Text>
            <Text style={styles.featureDescription}>
              Visualize content chronologically
            </Text>
          </View>
          
          <View style={styles.featureCard}>
            <Icon name="search" size={28} color={theme.info} />
            <Text style={styles.featureTitle}>Smart Search</Text>
            <Text style={styles.featureDescription}>
              Find content across all your files
            </Text>
          </View>
        </View>
      </View>

      {/* Processing Status */}
      {state.isProcessing && (
        <View style={styles.processingCard}>
          <Icon name="hourglass-empty" size={24} color={theme.primary} />
          <Text style={styles.processingText}>Processing files...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const getFileIcon = (fileType: string): string => {
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

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: 20,
      paddingTop: 40,
    },
    welcomeText: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    appTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text,
      marginTop: 4,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 4,
    },
    settingsButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      marginBottom: 20,
      gap: 15,
    },
    statsCard: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    statsNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      marginTop: 8,
    },
    statsLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 4,
    },
    section: {
      paddingHorizontal: 20,
      marginBottom: 30,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
    },
    seeAllText: {
      fontSize: 14,
      fontWeight: '600',
    },
    quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 15,
    },
    quickActionCard: {
      width: (width - 55) / 2,
      height: 100,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    quickActionText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
      marginTop: 8,
    },
    fileCard: {
      flexDirection: 'row',
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      alignItems: 'center',
    },
    fileIcon: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: theme.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    fileInfo: {
      flex: 1,
    },
    fileName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    fileDetails: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2,
    },
    fileStatus: {
      fontSize: 11,
      color: theme.primary,
      marginTop: 2,
      textTransform: 'capitalize',
    },
    fileActions: {
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyStateText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginTop: 16,
    },
    emptyStateSubtext: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 8,
      textAlign: 'center',
    },
    getStartedButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      marginTop: 20,
    },
    getStartedButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
    },
    featuresGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 15,
    },
    featureCard: {
      width: (width - 55) / 2,
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
    },
    featureTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginTop: 8,
    },
    featureDescription: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 4,
      lineHeight: 16,
    },
    processingCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 20,
      marginBottom: 20,
    },
    processingText: {
      fontSize: 14,
      color: theme.text,
      marginLeft: 12,
    },
  });

export default HomeScreen;
