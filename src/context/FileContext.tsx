import React, {createContext, useContext, useReducer, ReactNode} from 'react';
import {ExtractedFile, SearchResult, ProcessingStats} from '../types';

interface FileState {
  files: ExtractedFile[];
  selectedFiles: string[];
  searchResults: SearchResult[];
  processingStats: ProcessingStats;
  isProcessing: boolean;
  error: string | null;
}

type FileAction =
  | {type: 'ADD_FILE'; payload: ExtractedFile}
  | {type: 'UPDATE_FILE'; payload: ExtractedFile}
  | {type: 'REMOVE_FILE'; payload: string}
  | {type: 'SELECT_FILE'; payload: string}
  | {type: 'DESELECT_FILE'; payload: string}
  | {type: 'CLEAR_SELECTION'}
  | {type: 'SET_SEARCH_RESULTS'; payload: SearchResult[]}
  | {type: 'SET_PROCESSING'; payload: boolean}
  | {type: 'SET_ERROR'; payload: string | null}
  | {type: 'UPDATE_STATS'; payload: Partial<ProcessingStats>}
  | {type: 'BULK_ADD_FILES'; payload: ExtractedFile[]};

const initialState: FileState = {
  files: [],
  selectedFiles: [],
  searchResults: [],
  processingStats: {
    totalFiles: 0,
    processedFiles: 0,
    totalText: 0,
    totalImages: 0,
    totalTables: 0,
    processingTime: 0,
  },
  isProcessing: false,
  error: null,
};

function fileReducer(state: FileState, action: FileAction): FileState {
  switch (action.type) {
    case 'ADD_FILE':
      return {
        ...state,
        files: [...state.files, action.payload],
        processingStats: {
          ...state.processingStats,
          totalFiles: state.processingStats.totalFiles + 1,
        },
      };

    case 'UPDATE_FILE':
      return {
        ...state,
        files: state.files.map(file =>
          file.id === action.payload.id ? action.payload : file,
        ),
      };

    case 'REMOVE_FILE':
      return {
        ...state,
        files: state.files.filter(file => file.id !== action.payload),
        selectedFiles: state.selectedFiles.filter(id => id !== action.payload),
        processingStats: {
          ...state.processingStats,
          totalFiles: Math.max(0, state.processingStats.totalFiles - 1),
        },
      };

    case 'SELECT_FILE':
      return {
        ...state,
        selectedFiles: [...state.selectedFiles, action.payload],
      };

    case 'DESELECT_FILE':
      return {
        ...state,
        selectedFiles: state.selectedFiles.filter(id => id !== action.payload),
      };

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedFiles: [],
      };

    case 'SET_SEARCH_RESULTS':
      return {
        ...state,
        searchResults: action.payload,
      };

    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    case 'UPDATE_STATS':
      return {
        ...state,
        processingStats: {
          ...state.processingStats,
          ...action.payload,
        },
      };

    case 'BULK_ADD_FILES':
      return {
        ...state,
        files: [...state.files, ...action.payload],
        processingStats: {
          ...state.processingStats,
          totalFiles: state.processingStats.totalFiles + action.payload.length,
        },
      };

    default:
      return state;
  }
}

interface FileContextType {
  state: FileState;
  dispatch: React.Dispatch<FileAction>;
  addFile: (file: ExtractedFile) => void;
  updateFile: (file: ExtractedFile) => void;
  removeFile: (fileId: string) => void;
  selectFile: (fileId: string) => void;
  deselectFile: (fileId: string) => void;
  clearSelection: () => void;
  bulkAddFiles: (files: ExtractedFile[]) => void;
  setSearchResults: (results: SearchResult[]) => void;
  setProcessing: (processing: boolean) => void;
  setError: (error: string | null) => void;
  updateStats: (stats: Partial<ProcessingStats>) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({children}: {children: ReactNode}) {
  const [state, dispatch] = useReducer(fileReducer, initialState);

  const contextValue: FileContextType = {
    state,
    dispatch,
    addFile: (file: ExtractedFile) => dispatch({type: 'ADD_FILE', payload: file}),
    updateFile: (file: ExtractedFile) => dispatch({type: 'UPDATE_FILE', payload: file}),
    removeFile: (fileId: string) => dispatch({type: 'REMOVE_FILE', payload: fileId}),
    selectFile: (fileId: string) => dispatch({type: 'SELECT_FILE', payload: fileId}),
    deselectFile: (fileId: string) => dispatch({type: 'DESELECT_FILE', payload: fileId}),
    clearSelection: () => dispatch({type: 'CLEAR_SELECTION'}),
    bulkAddFiles: (files: ExtractedFile[]) => dispatch({type: 'BULK_ADD_FILES', payload: files}),
    setSearchResults: (results: SearchResult[]) => dispatch({type: 'SET_SEARCH_RESULTS', payload: results}),
    setProcessing: (processing: boolean) => dispatch({type: 'SET_PROCESSING', payload: processing}),
    setError: (error: string | null) => dispatch({type: 'SET_ERROR', payload: error}),
    updateStats: (stats: Partial<ProcessingStats>) => dispatch({type: 'UPDATE_STATS', payload: stats}),
  };

  return (
    <FileContext.Provider value={contextValue}>
      {children}
    </FileContext.Provider>
  );
}

export function useFileContext() {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFileContext must be used within a FileProvider');
  }
  return context;
}
