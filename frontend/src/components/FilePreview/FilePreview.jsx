import React from 'react';
import { X, Download, Share, Edit, Trash2 } from 'lucide-react';
import { useFiles } from '../../context/FileContext';
import styles from './FilePreview.module.css';

function FilePreview() {
  const { state, actions } = useFiles();

  if (!state.isPreviewModalOpen || !state.selectedFileForPreview) {
    return null;
  }

  const selectedFile = state.selectedFileForPreview;

  const handleClose = () => {
    actions.closePreviewModal();
  };

  const handleDownload = () => {
    console.log('Download file:', selectedFile);
    // In a real app, this would trigger a download
  };

  const handleShare = () => {
    actions.openShareModal(selectedFile);
  };

  const handleEdit = () => {
    console.log('Edit file:', selectedFile);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${selectedFile.name}"?`)) {
      actions.deleteFile(selectedFile.id);
      actions.closePreviewModal();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{selectedFile.name}</h2>
          <div className={styles.actions}>
            <button className={styles.actionButton} onClick={handleDownload} title="Download">
              <Download size={18} />
            </button>
            <button className={styles.actionButton} onClick={handleShare} title="Share">
              <Share size={18} />
            </button>
            <button className={styles.actionButton} onClick={handleEdit} title="Edit">
              <Edit size={18} />
            </button>
            <button className={styles.actionButton} onClick={handleDelete} title="Delete">
              <Trash2 size={18} />
            </button>
            <button className={styles.closeButton} onClick={handleClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.preview}>
            {selectedFile.mimeType?.startsWith('image/') ? (
              <img 
                src={selectedFile.thumbnail || selectedFile.url} 
                alt={selectedFile.name}
                className={styles.image}
              />
            ) : (
              <div className={styles.placeholder}>
                <div className={styles.placeholderIcon}>📄</div>
                <p>Preview not available</p>
                <button className={styles.downloadButton} onClick={handleDownload}>
                  <Download size={16} />
                  Download to view
                </button>
              </div>
            )}
          </div>

          <div className={styles.sidebar}>
            <div className={styles.section}>
              <h3>File Information</h3>
              <div className={styles.info}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Type:</span>
                  <span>{selectedFile.mimeType || 'Unknown'}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Size:</span>
                  <span>{formatFileSize(selectedFile.size)}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Created:</span>
                  <span>{formatDate(selectedFile.createdAt)}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Modified:</span>
                  <span>{formatDate(selectedFile.modifiedAt)}</span>
                </div>
              </div>
            </div>

            {selectedFile.tags && selectedFile.tags.length > 0 && (
              <div className={styles.section}>
                <h3>Tags</h3>
                <div className={styles.tags}>
                  {selectedFile.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.section}>
              <h3>Sharing</h3>
              <div className={styles.sharingInfo}>
                {selectedFile.isShared ? (
                  <div className={styles.shared}>
                    <span className={styles.sharedIcon}>🔗</span>
                    <span>Shared publicly</span>
                  </div>
                ) : (
                  <span className={styles.private}>Private</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilePreview;