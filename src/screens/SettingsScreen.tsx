import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useFileContext} from '../context/FileContext';
import {useTheme} from '../context/ThemeContext';
import {formatFileSize} from '../utils/helpers';

const SettingsScreen = ({navigation}: any) => {
  const {state, setError} = useFileContext();
  const {theme, isDark, toggleTheme} = useTheme();
  
  const [settings, setSettings] = useState({
    autoOCR: true,
    aiSummarization: true,
    timelineExtraction: true,
    notifications: true,
    autoBackup: false,
    highQualityOCR: true,
    compressImages: false,
    saveThumbnails: true,
  });

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({...prev, [key]: value}));
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data and thumbnails. Continue?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // Clear cache logic here
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Export all extracted content and metadata?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Export',
          onPress: () => {
            // Export logic here
            Alert.alert('Success', 'Data exported successfully');
          },
        },
      ]
    );
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all files and extracted content. This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'Are you absolutely sure? All data will be lost forever.',
              [
                {text: 'Cancel', style: 'cancel'},
                {
                  text: 'Delete Forever',
                  style: 'destructive',
                  onPress: () => {
                    // Delete all data logic here
                    Alert.alert('Success', 'All data deleted');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const getTotalStorageUsed = () => {
    return state.files.reduce((total, file) => total + file.size, 0);
  };

  const renderSettingItem = (
    iconName: string,
    title: string,
    subtitle: string,
    settingKey: string,
    value: boolean
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Icon name={iconName} size={24} color={theme.primary} />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={(newValue) => handleSettingChange(settingKey, newValue)}
        trackColor={{false: theme.border, true: theme.primary}}
        thumbColor={value ? 'white' : theme.textSecondary}
      />
    </View>
  );

  const renderActionItem = (
    iconName: string,
    title: string,
    subtitle: string,
    onPress: () => void,
    color?: string
  ) => (
    <TouchableOpacity style={styles.actionItem} onPress={onPress}>
      <View style={styles.settingInfo}>
        <Icon name={iconName} size={24} color={color || theme.primary} />
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, color && {color}]}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Icon name="chevron-right" size={24} color={theme.textSecondary} />
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.appInfo}>
            <View style={styles.appIcon}>
              <Icon name="auto-fix-high" size={32} color="white" />
            </View>
            <View style={styles.appDetails}>
              <Text style={styles.appName}>TextExtractor</Text>
              <Text style={styles.appVersion}>Version 1.0.0</Text>
              <Text style={styles.appDescription}>
                Universal file processing & content analysis
              </Text>
            </View>
          </View>
        </View>

        {/* Storage Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage</Text>
          <View style={styles.storageCard}>
            <View style={styles.storageRow}>
              <Text style={styles.storageLabel}>Files processed:</Text>
              <Text style={styles.storageValue}>{state.files.length}</Text>
            </View>
            <View style={styles.storageRow}>
              <Text style={styles.storageLabel}>Total storage used:</Text>
              <Text style={styles.storageValue}>
                {formatFileSize(getTotalStorageUsed())}
              </Text>
            </View>
            <View style={styles.storageRow}>
              <Text style={styles.storageLabel}>Images extracted:</Text>
              <Text style={styles.storageValue}>
                {state.files.reduce((sum, file) => 
                  sum + file.extractedContent.images.length, 0
                )}
              </Text>
            </View>
            <View style={styles.storageRow}>
              <Text style={styles.storageLabel}>Tables extracted:</Text>
              <Text style={styles.storageValue}>
                {state.files.reduce((sum, file) => 
                  sum + file.extractedContent.tables.length, 0
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Processing Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Processing</Text>
          {renderSettingItem(
            'auto-fix-high',
            'Auto OCR',
            'Automatically extract text from images',
            'autoOCR',
            settings.autoOCR
          )}
          {renderSettingItem(
            'summarize',
            'AI Summarization',
            'Generate summaries for extracted content',
            'aiSummarization',
            settings.aiSummarization
          )}
          {renderSettingItem(
            'timeline',
            'Timeline Extraction',
            'Automatically detect dates and create timelines',
            'timelineExtraction',
            settings.timelineExtraction
          )}
          {renderSettingItem(
            'high-quality',
            'High Quality OCR',
            'Use advanced OCR for better accuracy (slower)',
            'highQualityOCR',
            settings.highQualityOCR
          )}
        </View>

        {/* Storage Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage & Performance</Text>
          {renderSettingItem(
            'compress',
            'Compress Images',
            'Reduce image file sizes to save space',
            'compressImages',
            settings.compressImages
          )}
          {renderSettingItem(
            'image',
            'Save Thumbnails',
            'Generate thumbnails for faster loading',
            'saveThumbnails',
            settings.saveThumbnails
          )}
          {renderSettingItem(
            'backup',
            'Auto Backup',
            'Automatically backup data to cloud',
            'autoBackup',
            settings.autoBackup
          )}
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name={isDark ? 'dark-mode' : 'light-mode'} size={24} color={theme.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Dark Mode</Text>
                <Text style={styles.settingSubtitle}>Use dark theme</Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{false: theme.border, true: theme.primary}}
              thumbColor={isDark ? 'white' : theme.textSecondary}
            />
          </View>

          {renderSettingItem(
            'notifications',
            'Notifications',
            'Receive processing status updates',
            'notifications',
            settings.notifications
          )}
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          {renderActionItem(
            'file-download',
            'Export Data',
            'Export all extracted content and metadata',
            handleExportData
          )}
          
          {renderActionItem(
            'clear',
            'Clear Cache',
            'Free up space by clearing cached data',
            handleClearCache
          )}
          
          {renderActionItem(
            'delete-forever',
            'Delete All Data',
            'Permanently delete all files and content',
            handleDeleteAllData,
            theme.error
          )}
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          {renderActionItem(
            'help',
            'Help & Support',
            'Get help and contact support',
            () => Alert.alert('Help', 'Help documentation coming soon!')
          )}
          
          {renderActionItem(
            'privacy-tip',
            'Privacy Policy',
            'Read our privacy policy',
            () => Alert.alert('Privacy', 'Privacy policy coming soon!')
          )}
          
          {renderActionItem(
            'gavel',
            'Terms of Service',
            'View terms and conditions',
            () => Alert.alert('Terms', 'Terms of service coming soon!')
          )}
          
          {renderActionItem(
            'star',
            'Rate App',
            'Rate and review the app',
            () => Alert.alert('Rate', 'Thank you for your feedback!')
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ for document processing
          </Text>
          <Text style={styles.footerVersion}>
            TextExtractor v1.0.0
          </Text>
        </View>
      </ScrollView>
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
    placeholder: {
      width: 40,
    },
    content: {
      flex: 1,
    },
    section: {
      paddingHorizontal: 20,
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
    },
    appInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 20,
    },
    appIcon: {
      width: 60,
      height: 60,
      borderRadius: 16,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    appDetails: {
      flex: 1,
    },
    appName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
    },
    appVersion: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 2,
    },
    appDescription: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 4,
      lineHeight: 16,
    },
    storageCard: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
    },
    storageRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    storageLabel: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    storageValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    actionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    settingInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingText: {
      marginLeft: 16,
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    settingSubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2,
      lineHeight: 16,
    },
    footer: {
      alignItems: 'center',
      paddingVertical: 24,
      paddingHorizontal: 20,
    },
    footerText: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    footerVersion: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 4,
      textAlign: 'center',
    },
  });

export default SettingsScreen;
