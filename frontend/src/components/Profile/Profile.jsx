import React, { useEffect, useState } from 'react';
import styles from './Profile.module.css';

const API_BASE = '/api';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setProfile(data);
          setUsername(data.username);
          setEmail(data.email);
        } else {
          setError(data.error || 'Failed to load profile');
        }
      } catch (err) {
        setError('Network error');
      }
    };
    fetchProfile();
  }, []);

  const handleEdit = () => {
    setEditing(true);
    setMessage('');
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, email, password: password || undefined })
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        setEditing(false);
        setPassword('');
        setMessage('Profile updated!');
      } else {
        setError(data.error || 'Update failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  if (!profile) return <div className={styles.profileContainer}>Loading...</div>;

  return (
    <div className={styles.profileContainer}>
      <h2>Profile</h2>
      {message && <div className={styles.success}>{message}</div>}
      {error && <div className={styles.error}>{error}</div>}
      <form className={styles.profileForm} onSubmit={handleSave}>
        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          disabled={!editing}
        />
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={!editing}
        />
        <label>New Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Leave blank to keep current password"
          disabled={!editing}
        />
        {editing ? (
          <button type="submit">Save</button>
        ) : (
          <button type="button" onClick={handleEdit}>Edit</button>
        )}
      </form>
    </div>
  );
}

export default Profile;
