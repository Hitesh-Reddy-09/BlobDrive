import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useFiles } from '../../context/FileContext';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import FileGrid from '../FileGrid/FileGrid';
import FilePreview from '../FilePreview/FilePreview';
import ShareModal from '../ShareModal/ShareModal';
import UploadModal from '../UploadModal/UploadModal';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import Toast from '../Toast/Toast';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import styles from './Dashboard.module.css';

function Dashboard() {
  const { folderId } = useParams();
  const location = useLocation();
  const { actions, state } = useFiles();

  // Debug log for folderId
  console.log('Dashboard: folderId =', folderId);

  // Build the path array for breadcrumbs
  // Assume state.currentFolder is the current folder object, and state.folders is a map of all folders by _id
  const buildPath = () => {
    let path = [{ _id: null, name: 'My Drive' }];
    let folder = state.currentFolder;
    const foldersById = state.folders || {};
    // Traverse up to root
    while (folder && folder.parentId) {
      path.unshift({ _id: folder._id, name: folder.name });
      folder = foldersById[folder.parentId];
    }
    if (state.currentFolder && state.currentFolder._id) {
      path.push({ _id: state.currentFolder._id, name: state.currentFolder.name });
    }
    // Remove duplicates and keep order
    return path.filter((f, i, arr) => arr.findIndex(x => x._id === f._id) === i);
  };

  const path = buildPath();

  const handleBreadcrumbNavigate = (id, idx) => {
    if (id === null) {
      actions.setCurrentFolder(null);
    } else {
      actions.setCurrentFolder(id);
    }
    // Optionally, update the route if using React Router
    // navigate(id ? `/folder/${id}` : '/');
  };

  useEffect(() => {
    // Always fetch files from backend on mount or refresh
    actions.fetchFiles();
    // Set current folder based on route
    if (location.pathname.startsWith('/folder/')) {
      console.log('Dashboard: setting current folder to', folderId);
      actions.setCurrentFolder(folderId);
    } else {
      console.log('Dashboard: setting current folder to null');
      actions.setCurrentFolder(null);
    }
    // eslint-disable-next-line
  }, [folderId, location.pathname]);

  return (
    <div className={styles.dashboard}>
      <Header />
      <div className={styles.content}>
        <Sidebar />
        <main className={styles.main}>
          <Breadcrumbs path={path} onNavigate={handleBreadcrumbNavigate} />
          <FileGrid />
        </main>
      </div>
      <FilePreview />
      <ShareModal />
      <UploadModal />
      <ConfirmDialog />
      <Toast />
    </div>
  );
}

export default Dashboard;