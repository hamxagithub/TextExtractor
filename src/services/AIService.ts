import {TimelineEvent} from '../types';
import { generateId } from '../utils/helpers';


export class AIService {
  private apiKey: string | null = null;
  private isInitialized = false;

  async initialize(apiKey?: string): Promise<void> {
    try {
      this.apiKey = apiKey || null;
      this.isInitialized = true;
      console.log('AI Service initialized');
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
      throw error;
    }
  }

  async generateSummary(text: string, maxLength: number = 200): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Mock AI summarization
      // In production, this would use OpenAI, Google AI, or similar services
      return this.mockSummarize(text, maxLength);
    } catch (error) {
      console.error('Summary generation failed:', error);
      return this.fallbackSummary(text, maxLength);
    }
  }

  async extractKeywords(text: string, maxKeywords: number = 10): Promise<string[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Mock keyword extraction
      // In production, this would use NLP libraries or AI services
      return this.mockExtractKeywords(text, maxKeywords);
    } catch (error) {
      console.error('Keyword extraction failed:', error);
      return this.fallbackKeywords(text, maxKeywords);
    }
  }

  async extractTopics(text: string, maxTopics: number = 5): Promise<string[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Mock topic extraction
      // In production, this would use topic modeling algorithms
      return this.mockExtractTopics(text, maxTopics);
    } catch (error) {
      console.error('Topic extraction failed:', error);
      return [];
    }
  }

  async extractTimeline(text: string): Promise<TimelineEvent[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Mock timeline extraction
      // In production, this would use NER (Named Entity Recognition) for dates and events
      return this.mockExtractTimeline(text);
    } catch (error) {
      console.error('Timeline extraction failed:', error);
      return [];
    }
  }

  async analyzeContent(text: string): Promise<ContentAnalysis> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const analysis: ContentAnalysis = {
        sentiment: await this.analyzeSentiment(text),
        readabilityScore: this.calculateReadability(text),
        wordCount: text.split(/\s+/).length,
        characterCount: text.length,
        paragraphCount: text.split('\n\n').length,
        averageWordsPerSentence: this.calculateAverageWordsPerSentence(text),
        lexicalDiversity: this.calculateLexicalDiversity(text),
        complexity: this.assessComplexity(text),
      };

      return analysis;
    } catch (error) {
      console.error('Content analysis failed:', error);
      return this.getDefaultAnalysis();
    }
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Mock translation
      // In production, this would use Google Translate API or similar
      return `[Translated to ${targetLanguage}] ${text.substring(0, 100)}...`;
    } catch (error) {
      console.error('Translation failed:', error);
      return text;
    }
  }

  // Mock implementations for demonstration
  private mockSummarize(text: string, maxLength: number): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length <= 2) {
      return text;
    }

    // Simple extractive summarization - pick first and most "important" sentences
    const summary = sentences
      .slice(0, Math.min(3, sentences.length))
      .join('. ')
      .trim();

    return summary.length > maxLength 
      ? summary.substring(0, maxLength - 3) + '...'
      : summary + '.';
  }

  private mockExtractKeywords(text: string, maxKeywords: number): string[] {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);

    // Simple frequency-based keyword extraction
    const wordFreq: {[key: string]: number} = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // Filter out common stop words
    const stopWords = new Set(['this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'would', 'about', 'there', 'could', 'other', 'more', 'very', 'what', 'know', 'just', 'first', 'into', 'over', 'after', 'also', 'back', 'than', 'only', 'come', 'before', 'through', 'where', 'while']);

    return Object.entries(wordFreq)
      .filter(([word]) => !stopWords.has(word))
      .sort(([,a], [,b]) => b - a)
      .slice(0, maxKeywords)
      .map(([word]) => word);
  }

  private mockExtractTopics(text: string, maxTopics: number): string[] {
    const keywords = this.mockExtractKeywords(text, 20);
    const topics: string[] = [];

    // Group related keywords into topics
    const businessWords = keywords.filter(word => 
      ['business', 'company', 'market', 'revenue', 'profit', 'customer', 'service', 'product'].some(bw => word.includes(bw) || bw.includes(word))
    );
    if (businessWords.length > 0) topics.push('Business');

    const techWords = keywords.filter(word => 
      ['technology', 'software', 'digital', 'system', 'data', 'computer', 'internet', 'platform'].some(tw => word.includes(tw) || tw.includes(word))
    );
    if (techWords.length > 0) topics.push('Technology');

    const healthWords = keywords.filter(word => 
      ['health', 'medical', 'patient', 'treatment', 'doctor', 'hospital', 'medicine', 'care'].some(hw => word.includes(hw) || hw.includes(word))
    );
    if (healthWords.length > 0) topics.push('Healthcare');

    const educationWords = keywords.filter(word => 
      ['education', 'school', 'student', 'teacher', 'learning', 'university', 'academic', 'study'].some(ew => word.includes(ew) || ew.includes(word))
    );
    if (educationWords.length > 0) topics.push('Education');

    // Add generic topics if none found
    if (topics.length === 0) {
      topics.push('General Content');
    }

    return topics.slice(0, maxTopics);
  }

  private mockExtractTimeline(text: string): TimelineEvent[] {
    const events: TimelineEvent[] = [];
    
    // Simple date pattern matching
    const datePatterns = [
      /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/g,
      /(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/g,
      /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/gi,
      /(\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/gi,
    ];

    let eventIndex = 0;
    for (const pattern of datePatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null && eventIndex < 10) {
        const dateString = match[0];
        const context = this.getContextAroundMatch(text, match.index, 100);
        
        try {
          const date = new Date(dateString);
          if (!isNaN(date.getTime())) {
            events.push({
              id: generateId(),
              date,
              title: `Event ${eventIndex + 1}`,
              description: context.trim(),
              source: 'Document Analysis',
              category: 'General',
            });
            eventIndex++;
          }
        } catch (error) {
          // Skip invalid dates
        }
      }
    }

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private getContextAroundMatch(text: string, matchIndex: number, contextLength: number): string {
    const start = Math.max(0, matchIndex - contextLength / 2);
    const end = Math.min(text.length, matchIndex + contextLength / 2);
    return text.substring(start, end);
  }

  private async analyzeSentiment(text: string): Promise<SentimentScore> {
    // Mock sentiment analysis
    // In production, use sentiment analysis libraries or APIs
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'positive', 'success', 'happy', 'love'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'negative', 'failure', 'sad', 'hate', 'problem', 'issue'];

    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
      if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
    });

    const total = positiveCount + negativeCount;
    if (total === 0) {
      return { score: 0, label: 'neutral', confidence: 0.5 };
    }

    const score = (positiveCount - negativeCount) / total;
    let label: 'positive' | 'negative' | 'neutral';
    
    if (score > 0.1) label = 'positive';
    else if (score < -0.1) label = 'negative';
    else label = 'neutral';

    return {
      score,
      label,
      confidence: Math.min(0.95, Math.abs(score) + 0.5),
    };
  }

  private calculateReadability(text: string): number {
    // Simplified Flesch Reading Ease score
    const sentences = text.split(/[.!?]+/).length;
    const words = text.split(/\s+/).length;
    const syllables = this.countSyllables(text);

    if (sentences === 0 || words === 0) return 0;

    const score = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
    return Math.max(0, Math.min(100, score));
  }

  private countSyllables(text: string): number {
    // Simple syllable counting
    return text.toLowerCase()
      .replace(/[^a-z]/g, '')
      .replace(/[aeiouy]+/g, 'a')
      .replace(/a{2,}/g, 'a')
      .length;
  }

  private calculateAverageWordsPerSentence(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    return sentences.length > 0 ? words.length / sentences.length : 0;
  }

  private calculateLexicalDiversity(text: string): number {
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const uniqueWords = new Set(words);
    return words.length > 0 ? uniqueWords.size / words.length : 0;
  }

  private assessComplexity(text: string): 'low' | 'medium' | 'high' {
    const avgWordsPerSentence = this.calculateAverageWordsPerSentence(text);
    const lexicalDiversity = this.calculateLexicalDiversity(text);
    
    if (avgWordsPerSentence > 20 || lexicalDiversity > 0.7) return 'high';
    if (avgWordsPerSentence > 15 || lexicalDiversity > 0.5) return 'medium';
    return 'low';
  }

  private fallbackSummary(text: string, maxLength: number): string {
    return text.length > maxLength 
      ? text.substring(0, maxLength - 3) + '...'
      : text;
  }

  private fallbackKeywords(text: string, maxKeywords: number): string[] {
    const words = text.split(/\s+/).filter(word => word.length > 4);
    return words.slice(0, maxKeywords);
  }

  private getDefaultAnalysis(): ContentAnalysis {
    return {
      sentiment: { score: 0, label: 'neutral', confidence: 0.5 },
      readabilityScore: 50,
      wordCount: 0,
      characterCount: 0,
      paragraphCount: 0,
      averageWordsPerSentence: 0,
      lexicalDiversity: 0,
      complexity: 'medium',
    };
  }
}

// Type definitions
export interface SentimentScore {
  score: number; // -1 to 1
  label: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0 to 1
}

export interface ContentAnalysis {
  sentiment: SentimentScore;
  readabilityScore: number; // 0 to 100
  wordCount: number;
  characterCount: number;
  paragraphCount: number;
  averageWordsPerSentence: number;
  lexicalDiversity: number; // 0 to 1
  complexity: 'low' | 'medium' | 'high';
}
