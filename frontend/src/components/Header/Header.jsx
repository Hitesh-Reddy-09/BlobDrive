import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Grid,
  List,
  Upload,
  Settings,
  Moon,
  Sun,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useFiles } from "../../context/FileContext";
import { useTheme } from "../../context/ThemeContext";
import useProfile from "../../hooks/useProfile";
import styles from "./Header.module.css";

function Header() {
  const { state, actions } = useFiles();
  const { theme, toggleTheme } = useTheme();
  const { profile } = useProfile();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    actions.setSearchQuery(e.target.value);
  };

  const handleViewModeChange = (mode) => {
    actions.setViewMode(mode);
  };

  const handleUpload = () => {
    actions.openUploadModal();
  };

  const handleSignout = () => {
    localStorage.removeItem("token");
    setShowUserMenu(false);
    navigate("/login");
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
            </svg>
          </div>
          <span className={styles.logoText}>CloudVault</span>
        </div>

        {/* Navigation buttons */}
        <div style={{ display: "flex", gap: "0.5rem", marginLeft: "1rem" }}>
          <button
            onClick={() => actions.navBack()}
            disabled={!actions.canGoBack()}
            title="Go back"
            style={{
              background: "none",
              border: "none",
              cursor: actions.canGoBack() ? "pointer" : "not-allowed",
              opacity: actions.canGoBack() ? 1 : 0.5,
              padding: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => actions.navForward()}
            disabled={!actions.canGoForward()}
            title="Go forward"
            style={{
              background: "none",
              border: "none",
              cursor: actions.canGoForward() ? "pointer" : "not-allowed",
              opacity: actions.canGoForward() ? 1 : 0.5,
              padding: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className={styles.center}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Search files..."
            value={state.searchQuery}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewButton} ${
              state.viewMode === "grid" ? styles.active : ""
            }`}
            onClick={() => handleViewModeChange("grid")}
            title="Grid view"
          >
            <Grid size={18} />
          </button>
          <button
            className={`${styles.viewButton} ${
              state.viewMode === "list" ? styles.active : ""
            }`}
            onClick={() => handleViewModeChange("list")}
            title="List view"
          >
            <List size={18} />
          </button>
        </div>

        <button
          className={styles.uploadButton}
          onClick={handleUpload}
          title="Upload files"
        >
          <Upload size={18} />
          <span>Upload</span>
        </button>

        <button
          className={styles.iconButton}
          onClick={toggleTheme}
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className={styles.userMenu}>
          <button
            className={styles.userButton}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className={styles.avatar}>
              <User size={16} />
              {profile && (
                <div
                  style={{ fontSize: 10, marginTop: 2, textAlign: "center" }}
                >
                  {profile.username}
                </div>
              )}
            </div>
          </button>

          {showUserMenu && (
            <div className={styles.userDropdown}>
              <div className={styles.userInfo}>
                <div className={styles.userName}>
                  {profile ? profile.username : "User"}
                </div>
                <div className={styles.userEmail}>user@email.com</div>
              </div>
              <hr className={styles.divider} />
              <button className={styles.menuItem}>
                <Settings size={16} />
                Settings
              </button>
              <button className={styles.menuItem} onClick={handleSignout}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
