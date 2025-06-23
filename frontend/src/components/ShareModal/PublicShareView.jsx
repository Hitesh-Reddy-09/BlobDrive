import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Image as ImageIcon, File as FileIcon } from 'lucide-react';

const getFileIcon = (mimeType, size = 48) => {
  if (!mimeType) return <FileIcon size={size} color="#1976d2" />;
  if (mimeType.startsWith('image/')) return <ImageIcon size={size} color="#1976d2" />;
  if (mimeType.startsWith('text/')) return <FileText size={size} color="#388e3c" />;
  return <FileIcon size={size} color="#1976d2" />;
};

const PublicShareView = () => {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`/api/files/shared/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    })
      .then(res => {
        if (res.status === 401) throw new Error('signin-required');
        if (!res.ok) throw new Error('File not found or not shared');
        return res.json();
      })
      .then(data => {
        setFile(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (error === 'signin-required') {
    window.location.href = `/login?redirect=/shared/${id}`;
    return null;
  }
  if (loading) return <div style={{ padding: 32, minHeight: '100vh', background: '#f6f8fa' }}>Loading...</div>;
  if (error) return <div style={{ color: 'red', padding: 32, minHeight: '100vh', background: '#f6f8fa' }}>{error}</div>;
  if (!file) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f6f8fa 0%, #e3e9f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 32px rgba(25, 118, 210, 0.10)', padding: '40px 32px', maxWidth: 400, width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ marginBottom: 24 }}>
          {getFileIcon(file.mimeType)}
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#222', marginBottom: 8, wordBreak: 'break-all' }}>{file.name}</div>
        {file.azureBlobUrl ? (
          <a
            href={file.azureBlobUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              margin: '18px 0 0 0',
              padding: '12px 28px',
              background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
              color: '#fff',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 17,
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
              transition: 'background 0.2s',
            }}
          >
            Download / View File
          </a>
        ) : (
          <div style={{ color: '#888', margin: '18px 0 0 0' }}>No file URL available.</div>
        )}
        <div style={{ marginTop: 32, color: '#888', fontSize: 13 }}>
          <span style={{ userSelect: 'all' }}>Shared via <b>{window.location.origin}/shared/{id}</b></span>
        </div>
      </div>
    </div>
  );
};

export default PublicShareView; 