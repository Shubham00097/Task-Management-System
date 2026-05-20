import React, { useState } from 'react';
import { User, Mail, Lock, EyeOff, Eye, Shield, ArrowRight, CheckSquare } from 'lucide-react';

const API_BASE = '/api/v1';

export default function AuthForm({ onAuthSuccess, showToast }) {
  const [tab, setTab] = useState('login'); // 'login' or 'register'
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Handle Login form submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors.map(err => err.message));
        } else {
          setErrors([data.error?.message || 'Login failed']);
        }
        return;
      }

      onAuthSuccess(data.token, data.user);
      showToast(`Welcome back, ${data.user.name}!`, 'success');
    } catch (err) {
      setErrors(['Could not connect to server. Is the backend running?']);
    } finally {
      setLoading(false);
    }
  };

  // Handle Register form submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    // client side check
    if (regPassword.length < 6) {
      setErrors(['Password should be at least 6 characters long']);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors.map(err => err.message));
        } else {
          setErrors([data.error?.message || 'Sign up failed']);
        }
        return;
      }

      onAuthSuccess(data.token, data.user);
      showToast(data.message || `Account created! Welcome, ${data.user.name}!`, 'success');
    } catch (err) {
      setErrors(['Could not connect to server. Is the backend running?']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', width: '100%', maxWidth: '400px' }}>
      
      {/* Brand logo container */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
          <CheckSquare size={24} color="white" />
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#ffffff' }}>Task Manager</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '2px' }}>Student Assignment Project</p>
      </div>

      {/* Main card box */}
      <div className="card" style={{ padding: '24px' }}>
        
        {/* Toggle tabs */}
        <div style={{ display: 'flex', background: '#121214', borderRadius: '6px', padding: '4px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => { setTab('login'); setErrors([]); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              background: tab === 'login' ? 'var(--primary)' : 'transparent',
              color: tab === 'login' ? '#ffffff' : 'var(--text-sub)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.85rem',
            }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setErrors([]); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              background: tab === 'register' ? 'var(--primary)' : 'transparent',
              color: tab === 'register' ? '#ffffff' : 'var(--text-sub)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.85rem',
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Display form errors if any */}
        {errors.length > 0 && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '6px', padding: '10px', marginBottom: '16px' }}>
            {errors.map((err, i) => (
              <p key={i} style={{ color: '#f87171', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={12} /> {err}
              </p>
            ))}
          </div>
        )}

        {/* LOGIN FORM */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                  placeholder="name@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '36px', paddingRight: '36px' }}
                  placeholder="Enter password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                  placeholder="Enter name"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                  placeholder="name@email.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '36px', paddingRight: '36px' }}
                  placeholder="At least 6 chars"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.2)', padding: '8px 10px', borderRadius: '4px', fontSize: '0.78rem', color: 'var(--text-sub)', marginBottom: '14px' }}>
              💡 <strong>Note:</strong> The first user registered gets <strong>Admin</strong> rights automatically!
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
