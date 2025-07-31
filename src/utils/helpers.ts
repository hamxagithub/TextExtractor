import {FileType} from '../types';

// Generate unique IDs
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format file sizes
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format dates
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDateRelative(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return formatDate(date);
}

// Text processing utilities
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export function highlightText(text: string, searchTerm: string): string {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

export function extractSentences(text: string): string[] {
  return text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
}

// File type utilities
export function getFileTypeIcon(fileType: FileType): string {
  const iconMap: {[key in FileType]: string} = {
    pdf: 'picture-as-pdf',
    docx: 'description',
    xlsx: 'table-chart',
    pptx: 'slideshow',
    txt: 'text-fields',
    jpg: 'image',
    png: 'image',
    gif: 'gif',
    svg: 'image',
    other: 'insert-drive-file',
  };
  
  return iconMap[fileType] || 'insert-drive-file';
}

export function getFileTypeColor(fileType: FileType): string {
  const colorMap: {[key in FileType]: string} = {
    pdf: '#FF5722',
    docx: '#2196F3',
    xlsx: '#4CAF50',
    pptx: '#FF9800',
    txt: '#607D8B',
    jpg: '#E91E63',
    png: '#E91E63',
    gif: '#9C27B0',
    svg: '#3F51B5',
    other: '#757575',
  };
  
  return colorMap[fileType] || '#757575';
}

export function getMimeType(fileType: FileType): string {
  const mimeMap: {[key in FileType]: string} = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    jpg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    other: 'application/octet-stream',
  };
  
  return mimeMap[fileType] || 'application/octet-stream';
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateFileSize(size: number, maxSizeInMB: number = 50): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return size <= maxSizeInBytes;
}

export function validateFileName(fileName: string): boolean {
  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*]/;
  return !invalidChars.test(fileName) && fileName.length > 0 && fileName.length <= 255;
}

// Array utilities
export function groupBy<T>(array: T[], keyFn: (item: T) => string): {[key: string]: T[]} {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as {[key: string]: T[]});
}

export function sortBy<T>(array: T[], keyFn: (item: T) => any, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = keyFn(a);
    const bVal = keyFn(b);
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

export function unique<T>(array: T[], keyFn?: (item: T) => any): T[] {
  if (!keyFn) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Color utilities
export function hexToRgba(hex: string, alpha: number = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getContrastColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

// Storage utilities
export function saveToStorage(key: string, value: any): void {
  try {
    // In React Native, use AsyncStorage
    // For now, using localStorage simulation
    console.log(`Saving to storage: ${key}`, value);
  } catch (error) {
    console.error('Failed to save to storage:', error);
  }
}

export function loadFromStorage(key: string): any {
  try {
    // In React Native, use AsyncStorage
    // For now, return null
    console.log(`Loading from storage: ${key}`);
    return null;
  } catch (error) {
    console.error('Failed to load from storage:', error);
    return null;
  }
}

// Performance utilities
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Analytics utilities
export function trackEvent(eventName: string, properties?: any): void {
  console.log('Analytics event:', eventName, properties);
  // In production, integrate with analytics service
}

export function trackError(error: Error, context?: any): void {
  console.error('Tracked error:', error, context);
  // In production, integrate with error tracking service
}

// Platform utilities
export function isIOS(): boolean {
  // In React Native, use Platform.OS
  return false; // Placeholder
}

export function isAndroid(): boolean {
  // In React Native, use Platform.OS
  return true; // Placeholder
}

// Export utility functions as default
export default {
  generateId,
  formatFileSize,
  formatDate,
  formatDateRelative,
  truncateText,
  highlightText,
  escapeRegExp,
  countWords,
  extractSentences,
  getFileTypeIcon,
  getFileTypeColor,
  getMimeType,
  isValidEmail,
  isValidUrl,
  validateFileSize,
  validateFileName,
  groupBy,
  sortBy,
  unique,
  hexToRgba,
  getContrastColor,
  saveToStorage,
  loadFromStorage,
  debounce,
  throttle,
  trackEvent,
  trackError,
  isIOS,
  isAndroid,
};
