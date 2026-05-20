import React, { useState } from 'react';
import AuthForm from './components/AuthForm.jsx';
import Dashboard from './components/Dashboard.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import TokenInspector from './components/TokenInspector.jsx';
import Toast from './components/Toast.jsx';
import {
  LogOut, LayoutDashboard, Shield, CheckSquare, User, ChevronDown
} from 'lucide-react';

const TOKEN_KEY = 'tasksphere_token';
const USER_KEY = 'tasksphere_user';

export default function App() {
  // Try to load initial user session from localStorage
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Helper function to display alerts
  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  };

  // Called when login or signup succeeds
  const handleAuthSuccess = (newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setActiveTab('dashboard');
  };

  // Handle logout action
  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setMenuOpen(false);
    showToast('Signed out successfully.', 'warning');
  };

  // If user is not logged in, show the authorization form
  if (!token || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AuthForm onAuthSuccess={handleAuthSuccess} showToast={showToast} />
        {toast && (
          <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </div>
    );
  }

  // Navigation tabs based on user privileges
  const tabs = [
    { id: 'dashboard', label: 'My Tasks', icon: <LayoutDashboard size={16} /> },
    ...(user.role === 'ADMIN' ? [{ id: 'admin', label: 'Admin Dashboard', icon: <Shield size={16} /> }] : []),
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Top Navbar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 500,
          background: '#1a1a20',
          borderBottom: '1px solid var(--border-color)',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          height: '60px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '24px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckSquare size={18} color="white" />
          </div>
          <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#ffffff' }}>
            Task Manager
          </span>
        </div>

        {/* Navigation buttons */}
        <nav style={{ display: 'flex', gap: '8px', flex: 1 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: activeTab === tab.id ? '#272732' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                color: activeTab === tab.id ? 'var(--primary-light)' : 'var(--text-sub)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 500,
                transition: 'all 0.15s ease',
              }}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'admin' && (
                <span style={{ background: 'rgba(99,102,241,0.2)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', color: 'var(--primary-light)', fontWeight: 'bold', marginLeft: '4px' }}>
                  ADMIN
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User profile dropdown info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user.role === 'ADMIN' && (
            <span style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid var(--secondary)', borderRadius: '4px', padding: '2px 8px', fontSize: '0.7rem', color: 'var(--secondary)', fontWeight: 'bold' }}>
              ADMIN PRIVILEGES
            </span>
          )}

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#272732',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer',
                color: '#ffffff',
              }}
            >
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={13} color="white" />
              </div>
              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{user.name}</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-sub)' }}>{user.email}</span>
              </div>
              <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
            </button>

            {menuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  width: '180px',
                  background: '#1e1e24',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                  zIndex: 600,
                }}
              >
                <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Signed in as</p>
                  <p style={{ fontSize: '0.8rem', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--danger)',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    textAlign: 'left',
                  }}
                >
                  <LogOut size={14} /> Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Backdrop overlay to close user menu */}
      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400 }} onClick={() => setMenuOpen(false)} />
      )}

      {/* Main Body Grid */}
      <main style={{ flex: 1, padding: '24px 20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '2px' }}>
            {activeTab === 'dashboard' ? `Welcome, ${user.name}` : 'Admin Control Area'}
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem' }}>
            {activeTab === 'dashboard'
              ? 'Organize your work, update statuses, and meet deadlines.'
              : 'Modify system users, promote accounts, and delete inappropriate content.'}
          </p>
        </div>

        {activeTab === 'dashboard' && (
          <Dashboard user={user} token={token} showToast={showToast} />
        )}
        {activeTab === 'admin' && user.role === 'ADMIN' && (
          <AdminPanel token={token} currentUserId={user.id} showToast={showToast} />
        )}
      </main>

      {/* Developer Debug JWT Inspector widget */}
      <TokenInspector token={token} />

      {/* Notification Toast Alerts */}
      {toast && (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
