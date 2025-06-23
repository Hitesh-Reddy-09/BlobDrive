import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import styles from './Toast.module.css';

function Toast() {
  const [toasts, setToasts] = useState([]);

  // Mock function to add toast - in real app this would be from context
  const addToast = (toast) => {
    const id = Date.now();
    const newToast = { id, ...toast };
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, toast.duration || 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      case 'info':
      default:
        return <Info size={20} />;
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={`${styles.toast} ${styles[toast.type || 'info']}`}
        >
          <div className={styles.content}>
            <div className={styles.icon}>
              {getIcon(toast.type)}
            </div>
            <div className={styles.message}>
              {toast.title && (
                <div className={styles.title}>{toast.title}</div>
              )}
              <div className={styles.description}>{toast.message}</div>
            </div>
          </div>
          <button 
            className={styles.closeButton}
            onClick={() => removeToast(toast.id)}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default Toast;