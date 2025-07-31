export interface ExtractedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uri: string;
  extractedContent: ExtractedContent;
  uploadDate: Date;
  processingStatus: 'pending' | 'processing' | 'completed' | 'error';
}

export interface ExtractedContent {
  text: string;
  images: ExtractedImage[];
  tables: ExtractedTable[];
  metadata: FileMetadata;
  summary?: string;
  keywords?: string[];
  topics?: string[];
  timeline?: TimelineEvent[];
}

export interface ExtractedImage {
  id: string;
  uri: string;
  ocrText?: string;
  description?: string;
  width: number;
  height: number;
}

export interface ExtractedTable {
  id: string;
  headers: string[];
  rows: string[][];
  title?: string;
}

export interface FileMetadata {
  title?: string;
  author?: string;
  createdDate?: Date;
  modifiedDate?: Date;
  pageCount?: number;
  wordCount?: number;
  language?: string;
}

export interface TimelineEvent {
  id: string;
  date: Date;
  title: string;
  description: string;
  source: string;
  category?: string;
}

export interface SearchResult {
  fileId: string;
  fileName: string;
  content: string;
  relevanceScore: number;
  matchType: 'text' | 'ocr' | 'metadata';
  context: string;
}

export interface ProcessingStats {
  totalFiles: number;
  processedFiles: number;
  totalText: number;
  totalImages: number;
  totalTables: number;
  processingTime: number;
}

export type FileType = 
  | 'pdf'
  | 'docx'
  | 'xlsx'
  | 'pptx'
  | 'txt'
  | 'jpg'
  | 'png'
  | 'gif'
  | 'svg'
  | 'other';

export type SortOption = 
  | 'name'
  | 'date'
  | 'size'
  | 'type'
  | 'relevance';

export type ViewMode = 
  | 'list'
  | 'grid'
  | 'timeline'
  | 'map';
