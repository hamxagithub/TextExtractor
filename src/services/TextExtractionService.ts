import RNFS from 'react-native-fs';
import {ExtractedContent, ExtractedImage, ExtractedTable} from '../types';
import { generateId } from '../utils/helpers';


export class TextExtractionService {
  
  async extractFromPDF(uri: string): Promise<ExtractedContent> {
    try {
      // For React Native, we'll need to use a PDF parsing library
      // This is a placeholder implementation
      const content: ExtractedContent = {
        text: '',
        images: [],
        tables: [],
        metadata: {},
      };

      // Read file as base64 and process with PDF parser
      const base64Data = await RNFS.readFile(uri, 'base64');
      
      // TODO: Implement actual PDF parsing using react-native-pdf or similar
      // For now, return placeholder
      content.text = 'PDF content extraction not yet implemented';
      content.metadata = {
        title: 'PDF Document',
        pageCount: 1,
      };

      return content;
    } catch (error) {
      console.error('Error extracting from PDF:', error);
      throw error;
    }
  }

  async extractFromDOCX(uri: string): Promise<ExtractedContent> {
    try {
      const content: ExtractedContent = {
        text: '',
        images: [],
        tables: [],
        metadata: {},
      };

      // Read file as base64
      const base64Data = await RNFS.readFile(uri, 'base64');
      
      // TODO: Implement DOCX parsing using mammoth or similar
      // For now, return placeholder
      content.text = 'DOCX content extraction not yet implemented';
      content.metadata = {
        title: 'Word Document',
      };

      return content;
    } catch (error) {
      console.error('Error extracting from DOCX:', error);
      throw error;
    }
  }

  async extractFromXLSX(uri: string): Promise<ExtractedContent> {
    try {
      const content: ExtractedContent = {
        text: '',
        images: [],
        tables: [],
        metadata: {},
      };

      // Read file as base64
      const base64Data = await RNFS.readFile(uri, 'base64');
      
      // TODO: Implement XLSX parsing using xlsx library
      // For now, create sample table structure
      const sampleTable: ExtractedTable = {
        id: generateId(),
        title: 'Sample Excel Table',
        headers: ['Column 1', 'Column 2', 'Column 3'],
        rows: [
          ['Row 1 Data 1', 'Row 1 Data 2', 'Row 1 Data 3'],
          ['Row 2 Data 1', 'Row 2 Data 2', 'Row 2 Data 3'],
        ],
      };

      content.tables.push(sampleTable);
      content.text = 'Excel content extraction not yet implemented';
      content.metadata = {
        title: 'Excel Spreadsheet',
      };

      return content;
    } catch (error) {
      console.error('Error extracting from XLSX:', error);
      throw error;
    }
  }

  async extractFromPPTX(uri: string): Promise<ExtractedContent> {
    try {
      const content: ExtractedContent = {
        text: '',
        images: [],
        tables: [],
        metadata: {},
      };

      // Read file as base64
      const base64Data = await RNFS.readFile(uri, 'base64');
      
      // TODO: Implement PPTX parsing
      // For now, return placeholder
      content.text = 'PowerPoint content extraction not yet implemented';
      content.metadata = {
        title: 'PowerPoint Presentation',
      };

      return content;
    } catch (error) {
      console.error('Error extracting from PPTX:', error);
      throw error;
    }
  }

  async extractFromTXT(uri: string): Promise<ExtractedContent> {
    try {
      const content: ExtractedContent = {
        text: '',
        images: [],
        tables: [],
        metadata: {},
      };

      // Read text file content
      const textContent = await RNFS.readFile(uri, 'utf8');
      content.text = textContent;
      
      // Extract basic metadata
      const lines = textContent.split('\n');
      content.metadata = {
        title: 'Text Document',
        wordCount: textContent.split(/\s+/).length,
      };

      // Try to detect and extract simple tables (tab or comma separated)
      const tables = this.extractTablesFromText(textContent);
      content.tables = tables;

      return content;
    } catch (error) {
      console.error('Error extracting from TXT:', error);
      throw error;
    }
  }

  private extractTablesFromText(text: string): ExtractedTable[] {
    const tables: ExtractedTable[] = [];
    const lines = text.split('\n');
    
    let currentTable: string[][] = [];
    let inTable = false;
    
    for (const line of lines) {
      // Check if line looks like a table row (contains tabs or multiple commas)
      const tabCount = (line.match(/\t/g) || []).length;
      const commaCount = (line.match(/,/g) || []).length;
      
      if (tabCount >= 2 || commaCount >= 2) {
        const separator = tabCount >= 2 ? '\t' : ',';
        const cells = line.split(separator).map(cell => cell.trim());
        
        if (!inTable) {
          inTable = true;
          currentTable = [];
        }
        
        currentTable.push(cells);
      } else if (inTable && currentTable.length > 1) {
        // End of table, create table object
        const table: ExtractedTable = {
          id: generateId(),
          headers: currentTable[0],
          rows: currentTable.slice(1),
          title: `Table ${tables.length + 1}`,
        };
        tables.push(table);
        
        inTable = false;
        currentTable = [];
      } else if (inTable) {
        inTable = false;
        currentTable = [];
      }
    }
    
    // Handle table at end of file
    if (inTable && currentTable.length > 1) {
      const table: ExtractedTable = {
        id: generateId(),
        headers: currentTable[0],
        rows: currentTable.slice(1),
        title: `Table ${tables.length + 1}`,
      };
      tables.push(table);
    }
    
    return tables;
  }

  // Helper method to extract images from document files
  async extractImagesFromDocument(uri: string, fileType: string): Promise<ExtractedImage[]> {
    const images: ExtractedImage[] = [];
    
    try {
      // This would require specialized libraries for each document type
      // For now, return empty array
      // TODO: Implement image extraction from documents
      
    } catch (error) {
      console.error('Error extracting images from document:', error);
    }
    
    return images;
  }

  // Helper method to clean and normalize extracted text
  cleanText(text: string): string {
    return text
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
      .replace(/[ \t]+/g, ' ') // Normalize whitespace
      .trim();
  }

  // Helper method to extract metadata from text content
  extractTextMetadata(text: string): any {
    const lines = text.split('\n');
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const charCount = text.length;
    const lineCount = lines.length;
    
    // Try to detect language (basic implementation)
    const language = this.detectLanguage(text);
    
    return {
      wordCount,
      charCount,
      lineCount,
      language,
    };
  }

  private detectLanguage(text: string): string {
    // Very basic language detection
    // In a real implementation, you'd use a proper language detection library
    const sample = text.toLowerCase().slice(0, 1000);
    
    if (sample.includes('the ') && sample.includes(' and ')) {
      return 'en';
    } else if (sample.includes('der ') || sample.includes('die ') || sample.includes('das ')) {
      return 'de';
    } else if (sample.includes('le ') || sample.includes('la ') || sample.includes('les ')) {
      return 'fr';
    } else if (sample.includes('el ') || sample.includes('la ') || sample.includes('los ')) {
      return 'es';
    }
    
    return 'unknown';
  }
}
