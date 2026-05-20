import React, { useState, useEffect } from 'react';
import { Shield, Key, Eye, EyeOff, Clipboard, Check, AlertCircle, Clock } from 'lucide-react';

export default function TokenInspector({ token }) {
  const [open, setOpen] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [payload, setPayload] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [expired, setExpired] = useState(false);

  // Decode the token on change
  useEffect(() => {
    if (!token) {
      setPayload(null);
      setExpired(false);
      return;
    }

    try {
      // Basic client-side JWT decode
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      // decode the middle part (payload)
      const decodedPayload = JSON.parse(
        atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
      );
      setPayload(decodedPayload);
      setExpired(false);
    } catch (err) {
      setPayload(null);
      setExpired(true);
    }
  }, [token]);

  // Live timer for expiration countdown
  useEffect(() => {
    if (!payload || !payload.exp) return;

    const timer = setInterval(() => {
      const expTime = payload.exp * 1000;
      const diff = expTime - Date.now();

      if (diff <= 0) {
        setTimeLeft('Expired');
        setExpired(true);
        clearInterval(timer);
      } else {
        setExpired(false);
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        
        // Pad numbers to show hh:mm:ss format
        const hStr = hrs.toString().padStart(2, '0');
        const mStr = mins.toString().padStart(2, '0');
        const sStr = secs.toString().padStart(2, '0');
        setTimeLeft(`${hStr}:${mStr}:${sStr}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [payload]);

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!token) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '16px',
        zIndex: 900,
        maxWidth: '350px',
        width: 'calc(100% - 32px)',
      }}
    >
      
      {/* Floating trigger pill */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="btn btn-secondary"
          style={{
            padding: '8px 14px',
            fontSize: '0.8rem',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#1a1a20',
            borderColor: 'var(--primary)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          }}
        >
          <Shield size={14} style={{ color: 'var(--secondary)' }} />
          Inspect JWT Payload
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: expired ? 'var(--danger)' : 'var(--success)' }} />
        </button>
      )}

      {/* Main expanded inspector card */}
      {open && (
        <div
          className="card"
          style={{
            background: '#1e1e24',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={16} style={{ color: 'var(--secondary)' }} />
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Developer JWT Inspector</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.78rem' }}
            >
              Hide
            </button>
          </div>

          <hr style={{ border: 0, height: '1px', background: 'var(--border-color)' }} />

          {/* Raw Token string block */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', fontWeight: 'bold' }}>RAW BEARER TOKEN</span>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setReveal(!reveal)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                >
                  {reveal ? <EyeOff size={11} /> : <Eye size={11} />}
                  {reveal ? 'Hide' : 'Show'}
                </button>
                <button
                  type="button"
                  onClick={copyToken}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                >
                  {copied ? <Check size={11} style={{ color: 'var(--success)' }} /> : <Clipboard size={11} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '0.7rem',
                wordBreak: 'break-all',
                background: '#121214',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                color: reveal ? 'var(--primary-light)' : 'var(--text-muted)',
                maxHeight: '60px',
                overflowY: 'auto',
              }}
            >
              {reveal ? token : `${token.slice(0, 30)}...${token.slice(-30)}`}
            </div>
          </div>

          {/* Token information table */}
          {payload ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <div style={{ background: '#121214', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>ROLE CLAIM</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 'bold', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Key size={11} />
                    {payload.role}
                  </div>
                </div>
                <div style={{ background: '#121214', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>TIME REMAINING</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 'bold', marginTop: '2px', color: expired ? 'var(--danger)' : 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} />
                    {expired ? 'Expired' : timeLeft || 'Loading...'}
                  </div>
                </div>
              </div>

              {/* JSON code block */}
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                  DECODED PAYLOAD
                </span>
                <pre
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.7rem',
                    background: '#121214',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    color: '#a5b4fc',
                    maxHeight: '100px',
                    overflowY: 'auto',
                  }}
                >
                  {JSON.stringify(payload, null, 2)}
                </pre>
              </div>

            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '4px', color: 'var(--danger)', fontSize: '0.75rem' }}>
              <AlertCircle size={14} />
              <span>Token has expired. Please log in again.</span>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
