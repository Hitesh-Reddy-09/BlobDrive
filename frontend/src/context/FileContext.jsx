import React, { createContext, useContext, useReducer, useEffect } from 'react';

const FileContext = createContext();

const initialState = {
  files: [],
  currentFolder: null,
  selectedFiles: [],
  viewMode: 'grid', // 'grid' or 'list'
  sortBy: 'name', // 'name', 'modified', 'size', 'type'
  sortOrder: 'asc', // 'asc' or 'desc'
  searchQuery: '',
  uploadProgress: {},
  storageUsage: {
    used: 16.7 * 1024 * 1024 * 1024, // 16.7 GB in bytes
    total: 10 * 1024 * 1024 * 1024, // 10 GB in bytes
  },
  // Modal states
  isUploadModalOpen: false,
  isShareModalOpen: false,
  isPreviewModalOpen: false,
  selectedFileForPreview: null,
  selectedFileForShare: null
};

function fileReducer(state, action) {
  switch (action.type) {
    case 'SET_FILES':
      return { ...state, files: action.payload };
    
    case 'ADD_FILE':
      return { ...state, files: [...state.files, action.payload] };
    
    case 'UPDATE_FILE':
      return {
        ...state,
        files: state.files.map(file =>
          file.id === action.payload.id ? { ...file, ...action.payload } : file
        )
      };
    
    case 'DELETE_FILE':
      return {
        ...state,
        files: state.files.filter(file => file.id !== action.payload)
      };
    
    case 'SET_CURRENT_FOLDER':
      return { ...state, currentFolder: action.payload };
    
    case 'SET_SELECTED_FILES':
      return { ...state, selectedFiles: action.payload };
    
    case 'TOGGLE_FILE_SELECTION':
      const isSelected = state.selectedFiles.includes(action.payload);
      return {
        ...state,
        selectedFiles: isSelected
          ? state.selectedFiles.filter(id => id !== action.payload)
          : [...state.selectedFiles, action.payload]
      };
    
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    
    case 'SET_SORT':
      return {
        ...state,
        sortBy: action.payload.sortBy,
        sortOrder: action.payload.sortOrder
      };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_UPLOAD_PROGRESS':
      return {
        ...state,
        uploadProgress: { ...state.uploadProgress, ...action.payload }
      };
    
    case 'REMOVE_UPLOAD_PROGRESS':
      const newProgress = { ...state.uploadProgress };
      delete newProgress[action.payload];
      return { ...state, uploadProgress: newProgress };
    
    // Modal actions
    case 'OPEN_UPLOAD_MODAL':
      return { ...state, isUploadModalOpen: true };
    
    case 'CLOSE_UPLOAD_MODAL':
      return { ...state, isUploadModalOpen: false };
    
    case 'OPEN_SHARE_MODAL':
      return { 
        ...state, 
        isShareModalOpen: true,
        selectedFileForShare: action.payload 
      };
    
    case 'CLOSE_SHARE_MODAL':
      return { 
        ...state, 
        isShareModalOpen: false,
        selectedFileForShare: null 
      };
    
    case 'OPEN_PREVIEW_MODAL':
      return { 
        ...state, 
        isPreviewModalOpen: true,
        selectedFileForPreview: action.payload 
      };
    
    case 'CLOSE_PREVIEW_MODAL':
      return { 
        ...state, 
        isPreviewModalOpen: false,
        selectedFileForPreview: null 
      };
    
    default:
      return state;
  }
}

export function FileProvider({ children }) {
  const [state, dispatch] = useReducer(fileReducer, initialState);

  const actions = {
    // File operations
    addFile: (file) => {
      const newFile = {
        ...file,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        owner: 'user-1',
        isShared: false,
        shareSettings: {
          isPublic: false,
          permissions: 'view',
          expiresAt: null,
          password: null
        }
      };
      dispatch({ type: 'ADD_FILE', payload: newFile });
      return newFile;
    },

    updateFile: (file) => dispatch({ type: 'UPDATE_FILE', payload: file }),
    deleteFile: async (fileId) => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/files/${fileId}`, {
          method: 'DELETE',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
        if (!res.ok) throw new Error('Failed to delete file');
        actions.fetchFiles();
      } catch (err) {
        console.error('Error deleting file:', err);
        alert('Failed to delete file.');
      }
    },

    // Navigation
    setCurrentFolder: (folderId) => {
      console.log('FileContext: setCurrentFolder called with', folderId);
      dispatch({ type: 'SET_CURRENT_FOLDER', payload: folderId });
    },

    // Selection
    setSelectedFiles: (fileIds) => dispatch({ type: 'SET_SELECTED_FILES', payload: fileIds }),
    toggleFileSelection: (fileId) => dispatch({ type: 'TOGGLE_FILE_SELECTION', payload: fileId }),
    clearSelection: () => dispatch({ type: 'SET_SELECTED_FILES', payload: [] }),

    // View options
    setViewMode: (mode) => dispatch({ type: 'SET_VIEW_MODE', payload: mode }),
    setSort: (sortBy, sortOrder) => dispatch({ type: 'SET_SORT', payload: { sortBy, sortOrder } }),
    setSearchQuery: (query) => dispatch({ type: 'SET_SEARCH_QUERY', payload: query }),

    // Upload progress
    setUploadProgress: (progress) => dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: progress }),
    removeUploadProgress: (fileId) => dispatch({ type: 'REMOVE_UPLOAD_PROGRESS', payload: fileId }),

    // Modal actions
    openUploadModal: () => dispatch({ type: 'OPEN_UPLOAD_MODAL' }),
    closeUploadModal: () => dispatch({ type: 'CLOSE_UPLOAD_MODAL' }),
    openShareModal: (file) => dispatch({ type: 'OPEN_SHARE_MODAL', payload: file }),
    closeShareModal: () => dispatch({ type: 'CLOSE_SHARE_MODAL' }),
    openPreviewModal: (file) => dispatch({ type: 'OPEN_PREVIEW_MODAL', payload: file }),
    closePreviewModal: () => dispatch({ type: 'CLOSE_PREVIEW_MODAL' }),

    // Add fetchFiles action to get files from backend
    fetchFiles: async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/files', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
        if (!res.ok) throw new Error('Failed to fetch files');
        const files = await res.json();
        dispatch({ type: 'SET_FILES', payload: files });
      } catch (err) {
        console.error('Error fetching files:', err);
      }
    },

    // Utility functions
    getCurrentFiles: () => {
      return state.files.filter(file => {
        // Compare as strings to handle ObjectId and string
        const parentId = file.parentId ? file.parentId.toString() : null;
        const currentFolder = state.currentFolder ? state.currentFolder.toString() : null;
        return parentId === currentFolder;
      });
    },

    getFilteredFiles: () => {
      let files = state.files.filter(file => {
        // Compare as strings to handle ObjectId and string
        const parentId = file.parentId ? file.parentId.toString() : null;
        const currentFolder = state.currentFolder ? state.currentFolder.toString() : null;
        return parentId === currentFolder;
      });
      
      // Apply search filter
      if (state.searchQuery) {
        files = files.filter(file =>
          file.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          file.tags.some(tag => tag.toLowerCase().includes(state.searchQuery.toLowerCase()))
        );
      }

      // Apply sorting
      files.sort((a, b) => {
        let comparison = 0;
        
        switch (state.sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'modified':
            comparison = new Date(a.modifiedAt) - new Date(b.modifiedAt);
            break;
          case 'size':
            comparison = a.size - b.size;
            break;
          case 'type':
            comparison = (a.type || '').localeCompare(b.type || '');
            break;
          default:
            break;
        }
        
        return state.sortOrder === 'desc' ? -comparison : comparison;
      });

      return files;
    },

    getBreadcrumbs: () => {
      const breadcrumbs = [];
      let currentId = state.currentFolder;
      
      while (currentId) {
        const folder = state.files.find(f => f.id === currentId);
        if (folder) {
          breadcrumbs.unshift(folder);
          currentId = folder.parentId;
        } else {
          break;
        }
      }
      
      return breadcrumbs;
    }
  };

  return (
    <FileContext.Provider value={{ state, actions }}>
      {children}
    </FileContext.Provider>
  );
}

export function useFiles() {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
}