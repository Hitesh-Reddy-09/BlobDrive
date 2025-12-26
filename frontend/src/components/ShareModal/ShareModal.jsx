import React, { useEffect, useMemo, useState } from "react";
import { X, Eye, Users } from "lucide-react";
import { useFiles } from "../../context/FileContext";
import styles from "./ShareModal.module.css";

function ShareModal() {
  const { state, actions } = useFiles();
  const [shareSettings, setShareSettings] = useState({
    isPublic: false,
    permissions: "view",
    requireSignIn: false,
  });
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  // Generate share link for public consumption (frontend route)
  // Must be called before early return to follow Rules of Hooks
  const shareUrl = useMemo(() => {
    if (!state.selectedFileForShare) return "";
    return `${window.location.origin}/shared/${
      state.selectedFileForShare._id || state.selectedFileForShare.id
    }`;
  }, [state.selectedFileForShare]);

  // Initialize modal state from file's existing shareSettings
  // Must be called before early return to follow Rules of Hooks
  useEffect(() => {
    if (!state.selectedFileForShare) return;
    const existing = state.selectedFileForShare.shareSettings || {};
    setShareSettings({
      isPublic: !!existing.isPublic,
      permissions: existing.permissions || "view",
      requireSignIn: !!existing.requireSignIn,
    });
  }, [state.selectedFileForShare]);

  if (!state.isShareModalOpen || !state.selectedFileForShare) return null;

  const selectedFile = state.selectedFileForShare;

  const handleClose = () => {
    actions.closeShareModal();
  };

  const updateShareSettings = async (newSettings) => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/files/${selectedFile._id || selectedFile.id}/share`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ shareSettings: newSettings }),
      });
      // Refresh files so UI reflects updated share status
      await actions.fetchFiles();
      // Update selected file in modal with latest settings
      actions.openShareModal({
        ...selectedFile,
        shareSettings: newSettings,
        isShared: !!newSettings.isPublic,
      });
    } catch (err) {
      alert("Failed to update share settings");
    } finally {
      setSaving(false);
    }
  };

  const setPublic = (value) => {
    setShareSettings((prev) => ({ ...prev, isPublic: value }));
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleSettingChange = (setting, value) => {
    setShareSettings((prev) => ({ ...prev, [setting]: value }));
  };

  const handleSave = () => {
    updateShareSettings(shareSettings);
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Share "{selectedFile.name}"</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Users size={20} />
              <h3>General Access</h3>
            </div>

            <div className={styles.accessOption}>
              <label className={styles.accessLabel}>
                <input
                  type="radio"
                  name="access"
                  checked={!shareSettings.isPublic}
                  onChange={() => setPublic(false)}
                />
                <div className={styles.accessInfo}>
                  <div className={styles.accessTitle}>Restricted</div>
                  <div className={styles.accessDescription}>
                    Only people with access can open with the link
                  </div>
                </div>
              </label>
            </div>

            <div className={styles.accessOption}>
              <label className={styles.accessLabel}>
                <input
                  type="radio"
                  name="access"
                  checked={shareSettings.isPublic}
                  onChange={() => setPublic(true)}
                />
                <div className={styles.accessInfo}>
                  <div className={styles.accessTitle}>Anyone with the link</div>
                  <div className={styles.accessDescription}>
                    Anyone on the internet with the link can view
                  </div>
                </div>
              </label>
            </div>
          </div>

          {shareSettings.isPublic && (
            <>
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <Eye size={20} />
                  <h3>Security</h3>
                </div>

                <div className={styles.securityOptions}>
                  <div className={styles.option}>
                    <label className={styles.optionLabel}>
                      <input
                        type="checkbox"
                        checked={shareSettings.requireSignIn}
                        onChange={(e) =>
                          handleSettingChange("requireSignIn", e.target.checked)
                        }
                      />
                      Require sign-in
                    </label>
                    <p className={styles.optionDescription}>
                      Viewers must sign in to access
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <Eye size={20} />
                  <h3>Share Link</h3>
                </div>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className={styles.shareLinkInput}
                  />
                  <button
                    className={styles.copyButton}
                    onClick={handleCopyLink}
                    disabled={copied}
                  >
                    {copied ? "Copied!" : "Copy Link"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={handleClose}>
            Cancel
          </button>
          <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
