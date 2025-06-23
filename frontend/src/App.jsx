import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FileProvider } from './context/FileContext';
import { ThemeProvider } from './context/ThemeContext';
import RequireAuth from './components/Auth/RequireAuth';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/Login/Login';
import Signup from './components/Login/Signup';
import Profile from './components/Profile/Profile';
import PublicShareView from './components/ShareModal/PublicShareView';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <FileProvider>
        <Router>
          <div className="app">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/profile"
                element={
                  <RequireAuth>
                    <Profile />
                  </RequireAuth>
                }
              />
              <Route
                path="/"
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                }
              />
              <Route
                path="/folder/:folderId"
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                }
              />
              <Route
                path="/shared/:id"
                element={<PublicShareView />}
              />
              <Route
                path="/shared"
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                }
              />
              <Route
                path="/recent"
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                }
              />
              <Route
                path="/trash"
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                }
              />
            </Routes>
          </div>
        </Router>
      </FileProvider>
    </ThemeProvider>
  );
}

export default App;