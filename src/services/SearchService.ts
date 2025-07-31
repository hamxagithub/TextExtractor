import {ExtractedFile, SearchResult, SortOption} from '../types';

export class SearchService {
  private static instance: SearchService;

  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  // Main search function with AI-powered capabilities
  async search(
    query: string,
    files: ExtractedFile[],
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    const {
      includeText = true,
      includeOCR = true,
      includeMetadata = true,
      sortBy = 'relevance',
      maxResults = 50,
      threshold = 0.1,
    } = options;

    const results: SearchResult[] = [];

    for (const file of files) {
      // Search in text content
      if (includeText && file.extractedContent.text) {
        const textResults = this.searchInText(
          query,
          file.extractedContent.text,
          file.id,
          file.name,
          'text'
        );
        results.push(...textResults);
      }

      // Search in OCR text from images
      if (includeOCR) {
        for (const image of file.extractedContent.images) {
          if (image.ocrText) {
            const ocrResults = this.searchInText(
              query,
              image.ocrText,
              file.id,
              file.name,
              'ocr'
            );
            results.push(...ocrResults);
          }
        }
      }

      // Search in metadata
      if (includeMetadata) {
        const metadataResults = this.searchInMetadata(query, file);
        results.push(...metadataResults);
      }

      // Search in tables
      for (const table of file.extractedContent.tables) {
        const tableResults = this.searchInTable(query, table, file.id, file.name);
        results.push(...tableResults);
      }

      // Search in summary and keywords
      if (file.extractedContent.summary) {
        const summaryResults = this.searchInText(
          query,
          file.extractedContent.summary,
          file.id,
          file.name,
          'text'
        );
        results.push(...summaryResults);
      }

      if (file.extractedContent.keywords) {
        const keywordResults = this.searchInKeywords(
          query,
          file.extractedContent.keywords,
          file.id,
          file.name
        );
        results.push(...keywordResults);
      }
    }

    // Filter by relevance threshold
    const filteredResults = results.filter(result => result.relevanceScore >= threshold);

    // Sort results
    const sortedResults = this.sortResults(filteredResults, sortBy);

    // Limit results
    return sortedResults.slice(0, maxResults);
  }

  // Semantic search using basic similarity matching
  async semanticSearch(
    query: string,
    files: ExtractedFile[],
    maxResults: number = 20
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    for (const file of files) {
      // Calculate semantic similarity for full text
      if (file.extractedContent.text) {
        const similarity = this.calculateSemanticSimilarity(
          query,
          file.extractedContent.text
        );

        if (similarity > 0.1) {
          results.push({
            fileId: file.id,
            fileName: file.name,
            content: file.extractedContent.text.substring(0, 200) + '...',
            relevanceScore: similarity,
            matchType: 'text',
            context: this.extractRelevantContext(query, file.extractedContent.text),
          });
        }
      }

      // Check summary for semantic similarity
      if (file.extractedContent.summary) {
        const similarity = this.calculateSemanticSimilarity(
          query,
          file.extractedContent.summary
        );

        if (similarity > 0.2) {
          results.push({
            fileId: file.id,
            fileName: file.name,
            content: file.extractedContent.summary,
            relevanceScore: similarity,
            matchType: 'text',
            context: file.extractedContent.summary,
          });
        }
      }
    }

    return this.sortResults(results, 'relevance').slice(0, maxResults);
  }

  // Search within specific content types
  private searchInText(
    query: string,
    text: string,
    fileId: string,
    fileName: string,
    matchType: 'text' | 'ocr'
  ): SearchResult[] {
    const results: SearchResult[] = [];
    const queryTerms = this.preprocessQuery(query);
    const textLower = text.toLowerCase();

    for (const term of queryTerms) {
      const termLower = term.toLowerCase();
      let index = 0;

      while ((index = textLower.indexOf(termLower, index)) !== -1) {
        const context = this.extractContext(text, index, termLower.length);
        const relevanceScore = this.calculateRelevanceScore(term, text, context);

        results.push({
          fileId,
          fileName,
          content: context,
          relevanceScore,
          matchType,
          context,
        });

        index += termLower.length;
      }
    }

    // Combine and deduplicate results for this text
    return this.deduplicateResults(results);
  }

  private searchInMetadata(query: string, file: ExtractedFile): SearchResult[] {
    const results: SearchResult[] = [];
    const metadata = file.extractedContent.metadata;
    const queryLower = query.toLowerCase();

    // Search in title
    if (metadata.title && metadata.title.toLowerCase().includes(queryLower)) {
      results.push({
        fileId: file.id,
        fileName: file.name,
        content: metadata.title,
        relevanceScore: 0.9,
        matchType: 'metadata',
        context: `Title: ${metadata.title}`,
      });
    }

    // Search in author
    if (metadata.author && metadata.author.toLowerCase().includes(queryLower)) {
      results.push({
        fileId: file.id,
        fileName: file.name,
        content: metadata.author,
        relevanceScore: 0.8,
        matchType: 'metadata',
        context: `Author: ${metadata.author}`,
      });
    }

    return results;
  }

  private searchInTable(
    query: string,
    table: any,
    fileId: string,
    fileName: string
  ): SearchResult[] {
    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();

    // Search in table headers
    for (const header of table.headers) {
      if (header.toLowerCase().includes(queryLower)) {
        results.push({
          fileId,
          fileName,
          content: header,
          relevanceScore: 0.7,
          matchType: 'text',
          context: `Table header: ${header}`,
        });
      }
    }

    // Search in table rows
    for (let rowIndex = 0; rowIndex < table.rows.length; rowIndex++) {
      const row = table.rows[rowIndex];
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cell = row[colIndex];
        if (cell.toLowerCase().includes(queryLower)) {
          results.push({
            fileId,
            fileName,
            content: cell,
            relevanceScore: 0.6,
            matchType: 'text',
            context: `Table cell (Row ${rowIndex + 1}, Col ${colIndex + 1}): ${cell}`,
          });
        }
      }
    }

    return results;
  }

  private searchInKeywords(
    query: string,
    keywords: string[],
    fileId: string,
    fileName: string
  ): SearchResult[] {
    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();

    for (const keyword of keywords) {
      if (keyword.toLowerCase().includes(queryLower)) {
        results.push({
          fileId,
          fileName,
          content: keyword,
          relevanceScore: 0.8,
          matchType: 'text',
          context: `Keyword: ${keyword}`,
        });
      }
    }

    return results;
  }

  // Helper methods
  private preprocessQuery(query: string): string[] {
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 2);
  }

  private extractContext(text: string, position: number, matchLength: number): string {
    const contextLength = 150;
    const start = Math.max(0, position - contextLength / 2);
    const end = Math.min(text.length, position + matchLength + contextLength / 2);
    
    let context = text.substring(start, end);
    
    // Add ellipsis if truncated
    if (start > 0) context = '...' + context;
    if (end < text.length) context = context + '...';
    
    return context;
  }

  private extractRelevantContext(query: string, text: string): string {
    const sentences = text.split(/[.!?]+/);
    const queryTerms = this.preprocessQuery(query);
    
    // Find sentences containing query terms
    const relevantSentences = sentences.filter(sentence => {
      const sentenceLower = sentence.toLowerCase();
      return queryTerms.some(term => sentenceLower.includes(term));
    });

    if (relevantSentences.length > 0) {
      return relevantSentences.slice(0, 2).join('. ').trim() + '.';
    }

    return text.substring(0, 200) + '...';
  }

  private calculateRelevanceScore(term: string, fullText: string, context: string): number {
    let score = 0.5; // Base score

    // Exact match bonus
    if (context.toLowerCase().includes(term.toLowerCase())) {
      score += 0.3;
    }

    // Frequency bonus
    const termCount = (fullText.toLowerCase().match(new RegExp(term.toLowerCase(), 'g')) || []).length;
    score += Math.min(0.2, termCount * 0.05);

    // Position bonus (earlier in text = higher score)
    const position = fullText.toLowerCase().indexOf(term.toLowerCase());
    if (position !== -1) {
      const relativePosition = position / fullText.length;
      score += (1 - relativePosition) * 0.1;
    }

    return Math.min(1, score);
  }

  private calculateSemanticSimilarity(query: string, text: string): number {
    // Simple word overlap similarity
    const queryWords = new Set(this.preprocessQuery(query));
    const textWords = new Set(this.preprocessQuery(text));
    
    const intersection = new Set([...queryWords].filter(word => textWords.has(word)));
    const union = new Set([...queryWords, ...textWords]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private sortResults(results: SearchResult[], sortBy: SortOption): SearchResult[] {
    switch (sortBy) {
      case 'relevance':
        return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
      case 'name':
        return results.sort((a, b) => a.fileName.localeCompare(b.fileName));
      default:
        return results;
    }
  }

  private deduplicateResults(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>();
    return results.filter(result => {
      const key = `${result.fileId}-${result.content}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Advanced search features
  async advancedSearch(criteria: AdvancedSearchCriteria, files: ExtractedFile[]): Promise<SearchResult[]> {
    let results = files;

    // Filter by file type
    if (criteria.fileTypes && criteria.fileTypes.length > 0) {
      results = results.filter(file => criteria.fileTypes!.includes(file.type as any));
    }

    // Filter by date range
    if (criteria.dateRange) {
      results = results.filter(file => {
        const fileDate = file.uploadDate;
        return fileDate >= criteria.dateRange!.start && fileDate <= criteria.dateRange!.end;
      });
    }

    // Filter by size range
    if (criteria.sizeRange) {
      results = results.filter(file => {
        return file.size >= criteria.sizeRange!.min && file.size <= criteria.sizeRange!.max;
      });
    }

    // Apply text search if query provided
    if (criteria.query) {
      const searchResults = await this.search(criteria.query, results, criteria.searchOptions);
      return searchResults;
    }

    // Convert filtered files to search results
    return results.map(file => ({
      fileId: file.id,
      fileName: file.name,
      content: file.extractedContent.summary || file.extractedContent.text.substring(0, 200),
      relevanceScore: 1.0,
      matchType: 'text' as const,
      context: file.extractedContent.summary || 'No summary available',
    }));
  }

  // Filter and faceting
  getFacets(files: ExtractedFile[]): SearchFacets {
    const fileTypes = new Map<string, number>();
    const languages = new Map<string, number>();
    const topics = new Map<string, number>();
    const authors = new Map<string, number>();

    files.forEach(file => {
      // File types
      fileTypes.set(file.type, (fileTypes.get(file.type) || 0) + 1);

      // Languages
      const language = file.extractedContent.metadata.language || 'unknown';
      languages.set(language, (languages.get(language) || 0) + 1);

      // Authors
      if (file.extractedContent.metadata.author) {
        const author = file.extractedContent.metadata.author;
        authors.set(author, (authors.get(author) || 0) + 1);
      }

      // Topics
      if (file.extractedContent.topics) {
        file.extractedContent.topics.forEach(topic => {
          topics.set(topic, (topics.get(topic) || 0) + 1);
        });
      }
    });

    return {
      fileTypes: Object.fromEntries(fileTypes),
      languages: Object.fromEntries(languages),
      topics: Object.fromEntries(topics),
      authors: Object.fromEntries(authors),
    };
  }
}

// Type definitions
export interface SearchOptions {
  includeText?: boolean;
  includeOCR?: boolean;
  includeMetadata?: boolean;
  sortBy?: SortOption;
  maxResults?: number;
  threshold?: number;
}

export interface AdvancedSearchCriteria {
  query?: string;
  fileTypes?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sizeRange?: {
    min: number;
    max: number;
  };
  authors?: string[];
  languages?: string[];
  topics?: string[];
  searchOptions?: SearchOptions;
}

export interface SearchFacets {
  fileTypes: {[key: string]: number};
  languages: {[key: string]: number};
  topics: {[key: string]: number};
  authors: {[key: string]: number};
}
