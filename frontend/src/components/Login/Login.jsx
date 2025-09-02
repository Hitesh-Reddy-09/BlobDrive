import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { motion } from 'framer-motion';

const API_BASE = '/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        navigate('/');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className={styles.splitBg}>
      <div className={styles.illustrationSection}>
        <motion.div
          className={styles.auroraTextWrapper}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          <motion.h1
            className={`${styles.auroraText} ${hover ? styles.gradientText : ''}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1, type: 'spring', stiffness: 80 }}
            whileHover={{
              scale: 1.18,
              rotate: -6,
              textShadow: '0 0 32px #4cd1ff, 0 0 64px #1eebb1, 0 0 128px #9b59b6',
              boxShadow: '0 0 32px #4cd1ff55',
              transition: { duration: 0.4, type: 'spring', bounce: 0.5 }
            }}
            whileTap={{
              scale: 0.93,
              rotate: 8,
              transition: { type: 'spring', stiffness: 300 }
            }}
            style={{ cursor: 'pointer' }}
            onHoverStart={() => setHover(true)}
            onHoverEnd={() => setHover(false)}
          >
            Welcome to Blob Drive
          </motion.h1>
          <motion.p
            className={styles.auroraSubtext}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{
              color: '#4cd1ff',
              scale: 1.08,
              y: -6,
              transition: { duration: 0.4, type: 'spring' }
            }}
            transition={{ delay: 1.2, duration: 1, type: 'spring', stiffness: 60 }}
          >
            Your files, anywhere. Secure. Effortless. Modern.
          </motion.p>
        </motion.div>
      </div>
      <div className={styles.formSection}>
        <form className={styles.sleekForm} onSubmit={handleSubmit}>
          <h2 className={styles.formTitle}>Sign In</h2>
          <p className={styles.formSubtitle}>Welcome back! Please sign in to your account.</p>
          {error && <div className={styles.error}>{error}</div>}
          <label className={styles.inputLabel}>E-mail</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={styles.input}
            required
          />
          <label className={styles.inputLabel}>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={styles.input}
            required
          />
          <button type="submit" className={styles.primaryBtn}>Sign In</button>
          <div className={styles.switchText}>
            Don't have an account?{' '}
            <span className={styles.link} onClick={() => navigate('/signup')}>Sign up</span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
