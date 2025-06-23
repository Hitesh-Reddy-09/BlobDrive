import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import styles from './ConfirmDialog.module.css';

function ConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'default', // 'default', 'danger', 'warning'
    onConfirm: () => {},
    onCancel: () => {}
  });

  if (!isOpen) return null;

  const handleConfirm = () => {
    config.onConfirm();
    setIsOpen(false);
  };

  const handleCancel = () => {
    config.onCancel();
    setIsOpen(false);
  };

  const getIcon = () => {
    switch (config.type) {
      case 'danger':
        return <Trash2 size={24} className={styles.dangerIcon} />;
      case 'warning':
        return <AlertTriangle size={24} className={styles.warningIcon} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.overlay} onClick={handleCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            {getIcon()}
            <h2 className={styles.title}>{config.title}</h2>
          </div>
          <button className={styles.closeButton} onClick={handleCancel}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <p className={styles.message}>{config.message}</p>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={handleCancel}>
            {config.cancelText}
          </button>
          <button 
            className={`${styles.confirmButton} ${styles[config.type]}`}
            onClick={handleConfirm}
          >
            {config.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;