import React, { useState } from "react";
import {
  Folder,
  FileText,
  Image,
  FileIcon,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useFiles } from "../../context/FileContext";
import { useNavigate } from "react-router-dom";
import styles from "./FileGrid.module.css";

function FileGrid() {
  const { state, actions } = useFiles();
  const navigate = useNavigate();

  const files = actions.getFilteredFiles();
  const breadcrumbs = actions.getBreadcrumbs();

  // Dropdown state for each file
  const [dropdownOpen, setDropdownOpen] = useState({});

  const getFileIcon = (file) => {
    if (file.type === "folder") {
      return <Folder size={24} className={styles.folderIcon} />;
    }

    if (file.mimeType?.startsWith("image/")) {
      return <Image size={24} className={styles.imageIcon} />;
    }

    if (
      file.mimeType?.includes("document") ||
      file.mimeType?.includes("text")
    ) {
      return <FileText size={24} className={styles.documentIcon} />;
    }

    return <FileIcon size={24} className={styles.fileIcon} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "-";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    if (diffDays <= 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const handleFileClick = (file) => {
    if (file.type === "folder") {
      actions.pushNavigation(file._id || file.id);
      navigate(`/folder/${file._id || file.id}`);
    } else if (file.azureBlobUrl) {
      // Open the file in a new tab if it's a blob file
      window.open(file.azureBlobUrl, "_blank");
    } else {
      actions.openPreviewModal(file);
    }
  };

  const handleFileSelect = (file, e) => {
    e.stopPropagation();
    actions.toggleFileSelection(file._id || file.id);
  };

  const handleSort = (sortBy) => {
    const newSortOrder =
      state.sortBy === sortBy && state.sortOrder === "asc" ? "desc" : "asc";
    actions.setSort(sortBy, newSortOrder);
  };

  const getSortIcon = (sortBy) => {
    if (state.sortBy !== sortBy) return null;
    return state.sortOrder === "asc" ? (
      <ArrowUp size={16} />
    ) : (
      <ArrowDown size={16} />
    );
  };

  const handleDelete = (file) => {
    if (window.confirm(`Are you sure you want to delete '${file.name}'?`)) {
      actions.deleteFile(file._id || file.id);
      actions.fetchFiles();
    }
  };

  const handleDeleteSelected = async () => {
    if (state.selectedFiles.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to delete ${state.selectedFiles.length} selected item(s)?`
      )
    )
      return;
    await Promise.all(state.selectedFiles.map((id) => actions.deleteFile(id)));
    actions.clearSelection();
    actions.fetchFiles();
  };

  const toggleDropdown = (fileId) => {
    setDropdownOpen((prev) => ({ ...prev, [fileId]: !prev[fileId] }));
  };

  const handleShare = (file, e) => {
    e.stopPropagation();
    actions.openShareModal(file);
    setDropdownOpen((prev) => ({ ...prev, [file._id || file.id]: false }));
  };

  return (
    <div className={styles.container}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className={styles.breadcrumbs}>
          <button className={styles.breadcrumb} onClick={() => navigate("/")}>
            My Files
          </button>
          {breadcrumbs.map((folder) => (
            <React.Fragment key={folder._id || folder.id}>
              <span className={styles.breadcrumbSeparator}>/</span>
              <button
                className={styles.breadcrumb}
                onClick={() => navigate(`/folder/${folder._id || folder.id}`)}
              >
                {folder.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* File count and selection info */}
      <div className={styles.header}>
        <div className={styles.fileCount}>
          {files.length} {files.length === 1 ? "item" : "items"}
          {state.selectedFiles.length > 0 && (
            <span className={styles.selectionCount}>
              {state.selectedFiles.length} selected
            </span>
          )}
        </div>
        {state.selectedFiles.length > 0 && (
          <button
            className={styles.deleteButton}
            onClick={handleDeleteSelected}
          >
            <Trash2 size={16} /> Delete Selected
          </button>
        )}
        <div className={styles.sortControls}>
          <span className={styles.sortLabel}>Sort by:</span>
          <button
            className={`${styles.sortButton} ${
              state.sortBy === "name" ? styles.active : ""
            }`}
            onClick={() => handleSort("name")}
          >
            Name {getSortIcon("name")}
          </button>
          <button
            className={`${styles.sortButton} ${
              state.sortBy === "modified" ? styles.active : ""
            }`}
            onClick={() => handleSort("modified")}
          >
            Modified {getSortIcon("modified")}
          </button>
          <button
            className={`${styles.sortButton} ${
              state.sortBy === "size" ? styles.active : ""
            }`}
            onClick={() => handleSort("size")}
          >
            Size {getSortIcon("size")}
          </button>
        </div>
      </div>

      {/* File Grid */}
      {state.viewMode === "grid" ? (
        <div className={styles.grid}>
          {files.map((file) => (
            <div
              key={file._id || file.id}
              className={`${styles.fileCard} ${
                state.selectedFiles.includes(file._id || file.id)
                  ? styles.selected
                  : ""
              }`}
              onClick={() => handleFileClick(file)}
            >
              <div className={styles.fileCardHeader}>
                <input
                  type="checkbox"
                  checked={state.selectedFiles.includes(file._id || file.id)}
                  onChange={(e) => handleFileSelect(file, e)}
                  onClick={(e) => e.stopPropagation()}
                  className={styles.checkbox}
                />
                <button
                  className={styles.moreButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown(file._id || file.id);
                  }}
                >
                  <MoreHorizontal size={16} />
                </button>
                {dropdownOpen[file._id || file.id] && (
                  <div
                    className={styles.dropdownMenu}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className={styles.dropdownItem}
                      onClick={(e) => handleShare(file, e)}
                    >
                      Share
                    </button>
                    {/* Add more options here if needed */}
                  </div>
                )}
                <button
                  className={styles.moreButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(file);
                  }}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className={styles.filePreview}>
                {file.thumbnail ? (
                  <img
                    src={file.thumbnail}
                    alt={file.name}
                    className={styles.thumbnail}
                  />
                ) : (
                  <div className={styles.iconWrapper}>{getFileIcon(file)}</div>
                )}
              </div>

              <div className={styles.fileInfo}>
                <div className={styles.fileName}>{file.name}</div>
                <div className={styles.fileDetails}>
                  <span>Modified {formatDate(file.modifiedAt)}</span>
                  <span>{formatFileSize(file.size)}</span>
                </div>
                {file.tags.length > 0 && (
                  <div className={styles.tags}>
                    {file.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.list}>
          <div className={styles.listHeader}>
            <div className={styles.listColumn}>Name</div>
            <div className={styles.listColumn}>Modified</div>
            <div className={styles.listColumn}>Size</div>
            <div className={styles.listColumn}>Type</div>
            <div className={styles.listColumn}></div>
          </div>

          {files.map((file) => (
            <div
              key={file._id || file.id}
              className={`${styles.listRow} ${
                state.selectedFiles.includes(file.id) ? styles.selected : ""
              }`}
              onClick={() => handleFileClick(file)}
            >
              <div className={styles.listColumn}>
                <div className={styles.listFileInfo}>
                  <input
                    type="checkbox"
                    checked={state.selectedFiles.includes(file._id || file.id)}
                    onChange={(e) => handleFileSelect(file, e)}
                    onClick={(e) => e.stopPropagation()}
                    className={styles.checkbox}
                  />
                  {file.thumbnail ? (
                    <img
                      src={file.thumbnail}
                      alt={file.name}
                      className={styles.listThumbnail}
                    />
                  ) : (
                    getFileIcon(file)
                  )}
                  <div>
                    <div className={styles.listFileName}>{file.name}</div>
                    {file.azureBlobUrl && (
                      <a
                        href={file.azureBlobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.downloadLink}
                      >
                        Download
                      </a>
                    )}
                    {file.tags.length > 0 && (
                      <div className={styles.listTags}>
                        {file.tags.map((tag) => (
                          <span key={tag} className={styles.tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.listColumn}>
                {formatDate(file.modifiedAt)}
              </div>
              <div className={styles.listColumn}>
                {formatFileSize(file.size)}
              </div>
              <div className={styles.listColumn}>
                {file.type === "folder"
                  ? "Folder"
                  : file.mimeType?.split("/")[1] || "File"}
              </div>
              <div className={styles.listColumn}>
                <button
                  className={styles.moreButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown(file._id || file.id);
                  }}
                >
                  <MoreHorizontal size={16} />
                </button>
                {dropdownOpen[file._id || file.id] && (
                  <div
                    className={styles.dropdownMenu}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className={styles.dropdownItem}
                      onClick={(e) => handleShare(file, e)}
                    >
                      Share
                    </button>
                    {/* Add more options here if needed */}
                  </div>
                )}
                <button
                  className={styles.moreButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(file);
                  }}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {files.length === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <Folder size={64} />
          </div>
          <h3>No files found</h3>
          <p>
            {state.searchQuery
              ? "Try adjusting your search or filters"
              : "Upload files or create folders to get started"}
          </p>
        </div>
      )}
    </div>
  );
}

export default FileGrid;
