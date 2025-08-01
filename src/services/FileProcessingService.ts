import {launchImageLibrary, MediaType, ImagePickerResponse} from 'react-native-image-picker';
import ImagePicker from 'react-native-image-crop-picker';
import * as RNFS from 'react-native-fs';
import {ExtractedFile, ExtractedContent, FileType} from '../types';

import {TextExtractionService} from './TextExtractionService';
import {OCRService} from './OCRService';
import {AIService} from './AIService';
import { generateId } from '../utils/helpers';

interface DocumentPickerResponse {
  uri: string;
  name: string;
  type: string;
  size: number;
}

export class FileProcessingService {
  private static instance: FileProcessingService;
  private textExtractor = new TextExtractionService();
  private ocrService = new OCRService();
  private aiService = new AIService();

  public static getInstance(): FileProcessingService {
    if (!FileProcessingService.instance) {
      FileProcessingService.instance = new FileProcessingService();
    }
    return FileProcessingService.instance;
  }

  // File Upload Methods
  async pickDocuments(): Promise<DocumentPickerResponse[]> {
    try {
      // For now, we'll use the image picker for images only
      // In a real implementation, you would use a proper document picker
      const response = await launchImageLibrary({
        mediaType: 'photo' as MediaType,
        selectionLimit: 10,
        quality: 0.8,
        includeBase64: false,
      });
      
      if (response.assets) {
        return response.assets.map(asset => ({
          uri: asset.uri || '',
          name: asset.fileName || 'image.jpg',
          type: asset.type || 'image/jpeg',
          size: asset.fileSize || 0,
        }));
      }
      return [];
    } catch (error) {
      console.error('Error picking documents:', error);
      return [];
    }
  }

  async pickImages(): Promise<any[]> {
    try {
      const images = await ImagePicker.openPicker({
        multiple: true,
        mediaType: 'photo',
        includeBase64: false,
        compressImageQuality: 0.8,
      });
      return Array.isArray(images) ? images : [images];
  
    } catch (error) {
      return [];
    }
  }

  async takePhoto(): Promise<any> {
    try {
      const image = await ImagePicker.openCamera({
        mediaType: 'photo',
        includeBase64: false,
        compressImageQuality: 0.8,
      });
      return image;
    } catch (error) {
      throw error;
    }
  }

  // File Processing Methods
  async processFile(fileInfo: DocumentPickerResponse | any): Promise<ExtractedFile> {
    const fileId = generateId();
    const fileType = this.determineFileType(fileInfo.type || fileInfo.mime);
    
    const extractedFile: ExtractedFile = {
      id: fileId,
      name: fileInfo.name || `image_${Date.now()}`,
      type: fileType,
      size: fileInfo.size || 0,
      uri: fileInfo.uri,
      extractedContent: {
        text: '',
        images: [],
        tables: [],
        metadata: {},
      },
      uploadDate: new Date(),
      processingStatus: 'pending',
    };

    try {
      extractedFile.processingStatus = 'processing';
      
      // Extract content based on file type
      let extractedContent: ExtractedContent;
      
      if (this.isImageFile(fileType)) {
        extractedContent = await this.processImageFile(fileInfo);
      } else {
        extractedContent = await this.processDocumentFile(fileInfo, fileType);
      }

      // Apply AI processing
      if (extractedContent.text) {
        const summary = await this.aiService.generateSummary(extractedContent.text);
        const keywords = await this.aiService.extractKeywords(extractedContent.text);
        const topics = await this.aiService.extractTopics(extractedContent.text);
        const timeline = await this.aiService.extractTimeline(extractedContent.text);

        extractedContent.summary = summary;
        extractedContent.keywords = keywords;
        extractedContent.topics = topics;
        extractedContent.timeline = timeline;
      }

      extractedFile.extractedContent = extractedContent;
      extractedFile.processingStatus = 'completed';
      
    } catch (error) {
      console.error('Error processing file:', error);
      extractedFile.processingStatus = 'error';
    }

    return extractedFile;
  }

  async processBulkFiles(files: (DocumentPickerResponse | any)[]): Promise<ExtractedFile[]> {
    const processedFiles: ExtractedFile[] = [];
    
    for (const file of files) {
      try {
        const processedFile = await this.processFile(file);
        processedFiles.push(processedFile);
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        // Continue with other files even if one fails
      }
    }

    return processedFiles;
  }

  private async processImageFile(fileInfo: any): Promise<ExtractedContent> {
    const extractedContent: ExtractedContent = {
      text: '',
      images: [],
      tables: [],
      metadata: {
        title: fileInfo.name,
        createdDate: new Date(fileInfo.modificationDate || Date.now()),
      },
    };

    try {
      // Perform OCR on the image
      const ocrText = await this.ocrService.extractTextFromImage(fileInfo.uri);
      extractedContent.text = ocrText;

      // Add image to extracted images
      extractedContent.images.push({
        id: generateId(),
        uri: fileInfo.uri,
        ocrText,
        width: fileInfo.width || 0,
        height: fileInfo.height || 0,
      });

    } catch (error) {
      console.error('Error processing image:', error);
    }

    return extractedContent;
  }

  private async processDocumentFile(fileInfo: DocumentPickerResponse, fileType: FileType): Promise<ExtractedContent> {
    let extractedContent: ExtractedContent = {
      text: '',
      images: [],
      tables: [],
      metadata: {},
    };

    try {
      switch (fileType) {
        case 'pdf':
          extractedContent = await this.textExtractor.extractFromPDF(fileInfo.uri);
          break;
        case 'docx':
          extractedContent = await this.textExtractor.extractFromDOCX(fileInfo.uri);
          break;
        case 'xlsx':
          extractedContent = await this.textExtractor.extractFromXLSX(fileInfo.uri);
          break;
        case 'pptx':
          extractedContent = await this.textExtractor.extractFromPPTX(fileInfo.uri);
          break;
        case 'txt':
          extractedContent = await this.textExtractor.extractFromTXT(fileInfo.uri);
          break;
        default:
          // Try to read as plain text
          extractedContent = await this.textExtractor.extractFromTXT(fileInfo.uri);
          break;
      }

      // Process any embedded images with OCR
      for (const image of extractedContent.images) {
        if (!image.ocrText) {
          try {
            image.ocrText = await this.ocrService.extractTextFromImage(image.uri);
          } catch (error) {
            console.error('OCR failed for embedded image:', error);
          }
        }
      }

    } catch (error) {
      console.error('Error extracting from document:', error);
    }

    return extractedContent;
  }

  private determineFileType(mimeType: string): FileType {
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'docx';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'xlsx';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'pptx';
    if (mimeType.includes('text/plain')) return 'txt';
    if (mimeType.includes('image/jpeg')) return 'jpg';
    if (mimeType.includes('image/png')) return 'png';
    if (mimeType.includes('image/gif')) return 'gif';
    if (mimeType.includes('image/svg')) return 'svg';
    return 'other';
  }

  private isImageFile(fileType: FileType): boolean {
    return ['jpg', 'png', 'gif', 'svg'].includes(fileType);
  }

  // File Management Methods
  async deleteFile(fileUri: string): Promise<void> {
    try {
      const exists = await RNFS.exists(fileUri);
      if (exists) {
        await RNFS.unlink(fileUri);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  async shareFile(fileUri: string, fileName: string): Promise<void> {
    // This would integrate with react-native-share
    // Implementation depends on specific sharing requirements
  }

  async exportExtractedContent(content: ExtractedContent, format: 'txt' | 'json'): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `extracted_content_${timestamp}.${format}`;
    const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

    let contentToWrite: string;
    
    if (format === 'json') {
      contentToWrite = JSON.stringify(content, null, 2);
    } else {
      contentToWrite = this.formatContentAsText(content);
    }

    await RNFS.writeFile(filePath, contentToWrite, 'utf8');
    return filePath;
  }

  private formatContentAsText(content: ExtractedContent): string {
    let text = '';
    
    if (content.metadata.title) {
      text += `Title: ${content.metadata.title}\n\n`;
    }
    
    if (content.summary) {
      text += `Summary:\n${content.summary}\n\n`;
    }
    
    if (content.keywords && content.keywords.length > 0) {
      text += `Keywords: ${content.keywords.join(', ')}\n\n`;
    }
    
    text += `Content:\n${content.text}\n\n`;
    
    if (content.tables.length > 0) {
      text += 'Tables:\n';
      content.tables.forEach((table, index) => {
        text += `Table ${index + 1}:\n`;
        if (table.title) text += `${table.title}\n`;
        text += table.headers.join('\t') + '\n';
        table.rows.forEach(row => {
          text += row.join('\t') + '\n';
        });
        text += '\n';
      });
    }
    
    return text;
  }
}
