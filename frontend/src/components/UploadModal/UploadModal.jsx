import React, { useState, useRef } from 'react';
import { X, Upload, File, Image, FileText, Folder } from 'lucide-react';
import { useFiles } from '../../context/FileContext';
import styles from './UploadModal.module.css';
import { useParams } from 'react-router-dom';

function UploadModal() {
  const { state, actions } = useFiles();
  const { folderId } = useParams();
  // Debug log to check folder context
  console.log('UploadModal: state.currentFolder =', state.currentFolder, ', folderId =', folderId);
  const [dragActive, setDragActive] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]);
  const fileInputRef = useRef(null);

  if (!state.isUploadModalOpen) return null;

  const handleClose = () => {
    actions.closeUploadModal();
    setUploadQueue([]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const uploadFileToServer = async (uploadFile) => {
    setUploadQueue(prev =>
      prev.map(f =>
        f.id === uploadFile.id
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      )
    );

    const formData = new FormData();
    formData.append('file', uploadFile.file); // 'file' must match backend
    // Always use folderId from URL if present, fallback to state.currentFolder
    const parentId = folderId || state.currentFolder;
    if (parentId) {
      console.log('Uploading file with parentId:', parentId);
      formData.append('parentId', parentId);
    } else {
      console.log('Uploading file to root (no parentId)');
    }

    try {
      // Optionally get JWT token from localStorage or context
      const token = localStorage.getItem('token');
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });

      if (!response.ok) throw new Error('Upload failed');
      // Optionally parse response for file info
      setUploadQueue(prev =>
        prev.map(f =>
          f.id === uploadFile.id
            ? { ...f, progress: 100, status: 'completed' }
            : f
        )
      );
      // Optionally update file list from server here
      actions.fetchFiles && actions.fetchFiles();
    } catch (err) {
      setUploadQueue(prev =>
        prev.map(f =>
          f.id === uploadFile.id
            ? { ...f, status: 'error' }
            : f
        )
      );
    }
  };

  const handleFiles = (files) => {
    const newFiles = Array.from(files).map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'pending' // pending, uploading, completed, error
    }));
    
    setUploadQueue(prev => [...prev, ...newFiles]);

    // Upload each file to the server
    newFiles.forEach(uploadFile => {
      uploadFileToServer(uploadFile);
    });
  };

  const removeFromQueue = (fileId) => {
    setUploadQueue(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <Image size={20} className={styles.imageIcon} />;
    } else if (fileType.includes('document') || fileType.includes('text')) {
      return <FileText size={20} className={styles.documentIcon} />;
    } else {
      return <File size={20} className={styles.fileIcon} />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'var(--success-500)';
      case 'error': return 'var(--error-500)';
      case 'uploading': return 'var(--primary-500)';
      default: return 'var(--text-secondary)';
    }
  };

  const completedCount = uploadQueue.filter(f => f.status === 'completed').length;
  const totalCount = uploadQueue.length;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            Upload Files
            {totalCount > 0 && (
              <span className={styles.counter}>
                ({completedCount}/{totalCount})
              </span>
            )}
          </h2>
          <button className={styles.closeButton} onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          {uploadQueue.length === 0 ? (
            <div 
              className={`${styles.dropzone} ${dragActive ? styles.active : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={styles.dropzoneContent}>
                <Upload size={48} className={styles.uploadIcon} />
                <h3>Drag and drop files here</h3>
                <p>or click to browse and select files</p>
                <button className={styles.browseButton}>
                  Choose Files
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileInput}
                className={styles.hiddenInput}
              />
            </div>
          ) : (
            <div className={styles.uploadList}>
              {uploadQueue.map((uploadFile) => (
                <div key={uploadFile.id} className={styles.uploadItem}>
                  <div className={styles.fileInfo}>
                    {getFileIcon(uploadFile.type)}
                    <div className={styles.fileDetails}>
                      <div className={styles.fileName}>{uploadFile.name}</div>
                      <div className={styles.fileSize}>
                        {formatFileSize(uploadFile.size)}
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.uploadProgress}>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill}
                        style={{ 
                          width: `${uploadFile.progress}%`,
                          backgroundColor: getStatusColor(uploadFile.status)
                        }}
                      />
                    </div>
                    <div 
                      className={styles.progressText}
                      style={{ color: getStatusColor(uploadFile.status) }}
                    >
                      {uploadFile.status === 'completed' ? 'Complete' : 
                       uploadFile.status === 'error' ? 'Error' :
                       uploadFile.status === 'uploading' ? `${Math.round(uploadFile.progress)}%` :
                       'Pending'}
                    </div>
                  </div>

                  {uploadFile.status === 'completed' && (
                    <button 
                      className={styles.removeButton}
                      onClick={() => removeFromQueue(uploadFile.id)}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              
              <div className={styles.addMore}>
                <button 
                  className={styles.addMoreButton}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={16} />
                  Add More Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileInput}
                  className={styles.hiddenInput}
                />
              </div>
            </div>
          )}
        </div>

        {uploadQueue.length > 0 && (
          <div className={styles.footer}>
            <button className={styles.clearButton} onClick={() => setUploadQueue([])}>
              Clear All
            </button>
            <button 
              className={styles.doneButton} 
              onClick={handleClose}
              disabled={completedCount < totalCount}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadModal;