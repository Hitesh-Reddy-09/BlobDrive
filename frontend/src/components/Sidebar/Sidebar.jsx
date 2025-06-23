import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FolderOpen, 
  Upload, 
  Users, 
  Clock, 
  Trash2, 
  HardDrive,
  Plus,
  Folder
} from 'lucide-react';
import { useFiles } from '../../context/FileContext';
import useProfile from '../../hooks/useProfile';
import styles from './Sidebar.module.css';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, actions } = useFiles();
  const { profile } = useProfile();

  const navigationItems = [
    {
      id: 'my-files',
      label: 'My Files',
      icon: FolderOpen,
      path: '/',
      active: location.pathname === '/'
    },
    {
      id: 'shared',
      label: 'Shared with me',
      icon: Users,
      path: '/shared',
      active: location.pathname === '/shared'
    },
    {
      id: 'recent',
      label: 'Recent',
      icon: Clock,
      path: '/recent',  
      active: location.pathname === '/recent'
    },
    {
      id: 'trash',
      label: 'Trash',
      icon: Trash2,
      path: '/trash',
      active: location.pathname === '/trash'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleUpload = () => {
    actions.openUploadModal();
  };

  const handleCreateFolder = async () => {
    const folderName = prompt('Enter folder name:');
    if (folderName && folderName.trim()) {
      try {
        const token = localStorage.getItem('token');
        // Only send parentId if valid
        const parentId =
          state.currentFolder && /^[a-f\d]{24}$/i.test(state.currentFolder)
            ? state.currentFolder
            : null;
        const res = await fetch('/api/files', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            name: folderName.trim(),
            type: 'folder',
            parentId,
            size: 0,
            tags: [],
            owner: 'user-1',
            mimeType: null
          })
        });
        if (!res.ok) {
          const errJson = await res.json();
          throw new Error(errJson.error || 'Failed to create folder');
        }
        // Refresh file list from backend
        actions.fetchFiles();
      } catch (err) {
        alert('Error creating folder: ' + err.message);
      }
    }
  };

  const formatStorageSize = (bytes) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  const storagePercentage = (state.storageUsage.used / state.storageUsage.total) * 100;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.actions}>
        <button className={styles.uploadButton} onClick={handleUpload}>
          <Upload size={18} />
          Upload Files
        </button>
        
        <button className={styles.createButton} onClick={handleCreateFolder}>
          <Plus size={18} />
          Create Folder
        </button>
      </div>

      <nav className={styles.navigation}>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`${styles.navItem} ${item.active ? styles.active : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className={styles.storage}>
        <div className={styles.storageHeader}>
          <HardDrive size={20} />
          <span>Storage</span>
        </div>
        
        <div className={styles.storageInfo}>
          <div className={styles.storageBar}>
            <div 
              className={styles.storageProgress}
              style={{ width: `${Math.min(storagePercentage, 100)}%` }}
            />
          </div>
          <div className={styles.storageText}>
            {formatStorageSize(state.storageUsage.used)} of {formatStorageSize(state.storageUsage.total)} used
          </div>
        </div>
      </div>

      <div className={styles.user}>
        <div className={styles.userAvatar}>
          <span>{profile ? profile.username.charAt(0).toUpperCase() : 'U'}</span>
        </div>
        <div className={styles.userInfo}>
          <div className={styles.userName}>{profile ? profile.username : 'User'}</div>
          <div className={styles.userEmail}>{profile ? profile.email : ''}</div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;