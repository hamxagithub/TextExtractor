import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useFileContext} from '../context/FileContext';
import {useTheme} from '../context/ThemeContext';
import {FileProcessingService} from '../services/FileProcessingService';
import {formatFileSize, getFileTypeIcon} from '../utils/helpers';

const FileUploadScreen = ({navigation, route}: any) => {
  const {addFile, bulkAddFiles, setProcessing, setError} = useFileContext();
  const {theme} = useTheme();
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileService = FileProcessingService.getInstance();

  const openCamera = route?.params?.openCamera;

  useEffect(() => {
    if (openCamera) {
      handleTakePhoto();
    }
  }, [openCamera]);

  const handlePickDocuments = async () => {
    try {
      const results = await fileService.pickDocuments();
      if (results.length > 0) {
        setSelectedFiles([...selectedFiles, ...results]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick documents');
      console.error('Document picker error:', error);
    }
  };

  const handlePickImages = async () => {
    try {
      const results = await fileService.pickImages();
      if (results.length > 0) {
        setSelectedFiles([...selectedFiles, ...results]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick images');
      console.error('Image picker error:', error);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const result = await fileService.takePhoto();
      if (result) {
        setSelectedFiles([...selectedFiles, result]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
      console.error('Camera error:', error);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  const handleProcessFiles = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('No Files', 'Please select files to process');
      return;
    }

    setIsUploading(true);
    setProcessing(true);
    setError(null);

    try {
      const totalFiles = selectedFiles.length;
      let processedCount = 0;

      for (const file of selectedFiles) {
        try {
          const processedFile = await fileService.processFile(file);
          addFile(processedFile);
          
          processedCount++;
          setUploadProgress((processedCount / totalFiles) * 100);
        } catch (error) {
          console.error(`Failed to process file ${file.name}:`, error);
          setError(`Failed to process ${file.name}`);
        }
      }

      setSelectedFiles([]);
      Alert.alert(
        'Success',
        `Successfully processed ${processedCount} of ${totalFiles} files`,
        [{text: 'OK', onPress: () => navigation.navigate('Content')}]
      );

    } catch (error) {
      console.error('Bulk processing error:', error);
      setError('Failed to process files');
      Alert.alert('Error', 'Failed to process files');
    } finally {
      setIsUploading(false);
      setProcessing(false);
      setUploadProgress(0);
    }
  };

  const handleBulkProcess = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setProcessing(true);

    try {
      const processedFiles = await fileService.processBulkFiles(selectedFiles);
      bulkAddFiles(processedFiles);
      
      setSelectedFiles([]);
      Alert.alert(
        'Success',
        `Successfully processed ${processedFiles.length} files`,
        [{text: 'OK', onPress: () => navigation.navigate('Content')}]
      );
    } catch (error) {
      console.error('Bulk processing error:', error);
      setError('Failed to process files');
      Alert.alert('Error', 'Failed to process files');
    } finally {
      setIsUploading(false);
      setProcessing(false);
    }
  };

  const renderFileItem = ({item, index}: {item: any; index: number}) => (
    <View style={styles.fileItem}>
      <View style={styles.fileIcon}>
        <Icon
          name={getFileTypeIcon(item.type || 'other')}
          size={24}
          color={theme.primary}
        />
      </View>
      <View style={styles.fileInfo}>
        <Text style={styles.fileName} numberOfLines={1}>
          {item.name || `Image_${index + 1}`}
        </Text>
        <Text style={styles.fileSize}>
          {formatFileSize(item.size || 0)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveFile(index)}>
        <Icon name="close" size={20} color={theme.error} />
      </TouchableOpacity>
    </View>
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
        <Text style={styles.headerTitle}>Upload Files</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Upload Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Files</Text>
          <View style={styles.uploadOptions}>
            <TouchableOpacity
              style={styles.uploadOption}
              onPress={handlePickDocuments}
              disabled={isUploading}>
              <Icon name="folder" size={32} color={theme.primary} />
              <Text style={styles.uploadOptionTitle}>Documents</Text>
              <Text style={styles.uploadOptionSubtitle}>
                PDF, Word, Excel, PowerPoint
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadOption}
              onPress={handlePickImages}
              disabled={isUploading}>
              <Icon name="image" size={32} color={theme.secondary} />
              <Text style={styles.uploadOptionTitle}>Images</Text>
              <Text style={styles.uploadOptionSubtitle}>
                JPEG, PNG, GIF, SVG
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadOption}
              onPress={handleTakePhoto}
              disabled={isUploading}>
              <Icon name="camera-alt" size={32} color={theme.success} />
              <Text style={styles.uploadOptionTitle}>Camera</Text>
              <Text style={styles.uploadOptionSubtitle}>
                Take a photo
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Selected Files ({selectedFiles.length})
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedFiles([])}
                disabled={isUploading}>
                <Text style={[styles.clearAllText, {color: theme.error}]}>
                  Clear All
                </Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={selectedFiles}
              renderItem={renderFileItem}
              keyExtractor={(item, index) => `${item.name || 'file'}_${index}`}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Processing Options */}
        {selectedFiles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Processing Options</Text>
            <View style={styles.processingOptions}>
              <View style={styles.processingOption}>
                <Icon name="auto-fix-high" size={24} color={theme.primary} />
                <View style={styles.processingOptionContent}>
                  <Text style={styles.processingOptionTitle}>OCR Enabled</Text>
                  <Text style={styles.processingOptionSubtitle}>
                    Extract text from images and scanned documents
                  </Text>
                </View>
              </View>

              <View style={styles.processingOption}>
                <Icon name="summarize" size={24} color={theme.secondary} />
                <View style={styles.processingOptionContent}>
                  <Text style={styles.processingOptionTitle}>AI Analysis</Text>
                  <Text style={styles.processingOptionSubtitle}>
                    Generate summaries and extract keywords
                  </Text>
                </View>
              </View>

              <View style={styles.processingOption}>
                <Icon name="timeline" size={24} color={theme.success} />
                <View style={styles.processingOptionContent}>
                  <Text style={styles.processingOptionTitle}>Timeline Extraction</Text>
                  <Text style={styles.processingOptionSubtitle}>
                    Identify dates and create timelines
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>Processing Files...</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  {width: `${uploadProgress}%`, backgroundColor: theme.primary}
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(uploadProgress)}% complete
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.processButton,
              {
                backgroundColor: selectedFiles.length > 0 ? theme.primary : theme.border,
                opacity: isUploading ? 0.6 : 1,
              },
            ]}
            onPress={handleProcessFiles}
            disabled={selectedFiles.length === 0 || isUploading}>
            {isUploading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Icon name="cloud-upload" size={20} color="white" />
            )}
            <Text style={styles.processButtonText}>
              {isUploading ? 'Processing...' : `Process ${selectedFiles.length} Files`}
            </Text>
          </TouchableOpacity>

          {selectedFiles.length > 1 && (
            <TouchableOpacity
              style={[styles.bulkButton, {borderColor: theme.primary}]}
              onPress={handleBulkProcess}
              disabled={isUploading}>
              <Icon name="fast-forward" size={20} color={theme.primary} />
              <Text style={[styles.bulkButtonText, {color: theme.primary}]}>
                Bulk Process
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Tips</Text>
          <View style={styles.tip}>
            <Text style={styles.tipText}>
              • For best OCR results, ensure images are clear and well-lit
            </Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipText}>
              • Supported formats: PDF, DOCX, XLSX, PPTX, TXT, JPG, PNG, GIF, SVG
            </Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipText}>
              • Large files may take longer to process
            </Text>
          </View>
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
      padding: 20,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
    },
    clearAllText: {
      fontSize: 14,
      fontWeight: '600',
    },
    uploadOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 15,
    },
    uploadOption: {
      flex: 1,
      minWidth: 150,
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
    },
    uploadOptionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginTop: 12,
      textAlign: 'center',
    },
    uploadOptionSubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 4,
      textAlign: 'center',
    },
    fileItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
    },
    fileIcon: {
      width: 32,
      height: 32,
      borderRadius: 6,
      backgroundColor: theme.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    fileInfo: {
      flex: 1,
    },
    fileName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
    },
    fileSize: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2,
    },
    removeButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    processingOptions: {
      gap: 12,
    },
    processingOption: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 8,
      padding: 16,
    },
    processingOptionContent: {
      marginLeft: 12,
      flex: 1,
    },
    processingOptionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
    },
    processingOptionSubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2,
    },
    progressSection: {
      padding: 20,
      backgroundColor: theme.surface,
      marginHorizontal: 20,
      borderRadius: 12,
      marginBottom: 20,
    },
    progressTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    progressBar: {
      height: 8,
      backgroundColor: theme.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
    },
    progressText: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 8,
    },
    actionButtons: {
      padding: 20,
      gap: 12,
    },
    processButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      padding: 16,
      gap: 8,
    },
    processButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    bulkButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      padding: 16,
      borderWidth: 2,
      gap: 8,
    },
    bulkButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    tipsSection: {
      padding: 20,
      backgroundColor: theme.surface,
      margin: 20,
      borderRadius: 12,
    },
    tipsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 12,
    },
    tip: {
      marginBottom: 8,
    },
    tipText: {
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 18,
    },
  });

export default FileUploadScreen;
