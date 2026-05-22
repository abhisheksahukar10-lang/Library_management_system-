// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { getStudents, getFaculty } from '../services/api';

/**
 * Login page — 3 roles: Admin, Student, Professor.
 * Admin: one-click (no credentials needed for demo).
 * Student/Professor: select from dropdown of registered users.
 */
function Login({ onLogin }) {
  const [mode,    setMode]    = useState(null); // null | 'ADMIN' | 'STUDENT' | 'FACULTY'
  const [users,   setUsers]   = useState([]);
  const [selId,   setSelId]   = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const selectMode = (m) => {
    setMode(m); setError(''); setSelId(''); setLoading(true);
    if (m === 'STUDENT') {
      getStudents()
        .then(r => { setUsers(r.data); setLoading(false); })
        .catch(() => { setError('Could not load students. Is the backend running?'); setLoading(false); });
    } else if (m === 'FACULTY') {
      getFaculty()
        .then(r => { setUsers(r.data); setLoading(false); })
        .catch(() => { setError('Could not load professors. Is the backend running?'); setLoading(false); });
    } else {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    if (mode === 'ADMIN') {
      onLogin({ id: 0, name: 'Library Admin', email: 'admin@library.com', role: 'ADMIN' });
      return;
    }
    if (!selId) { setError('Please select a user.'); return; }
    const u = users.find(x => x.id === parseInt(selId));
    if (!u) { setError('User not found.'); return; }
    onLogin({ id: u.id, name: u.name, email: u.email, role: mode });
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">📚</div>
        <h1 className="login-title">UniLibrary</h1>
        <p className="login-sub">University Library Management System</p>

        {!mode ? (
          <>
            <p style={{ color: '#4a5568', marginBottom: '20px', textAlign: 'center' }}>
              Select your role to continue
            </p>
            <div className="role-cards">
              <div className="role-card" onClick={() => selectMode('ADMIN')}>
                <div className="role-icon">🔑</div>
                <div className="role-name">Admin</div>
                <div className="role-desc">Full system access</div>
              </div>
              <div className="role-card" onClick={() => selectMode('STUDENT')}>
                <div className="role-icon">🎓</div>
                <div className="role-name">Student</div>
                <div className="role-desc">Borrow up to 3 books</div>
              </div>
              <div className="role-card" onClick={() => selectMode('FACULTY')}>
                <div className="role-icon">👨‍🏫</div>
                <div className="role-name">Professor</div>
                <div className="role-desc">Borrow up to 10 books</div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <span style={{ fontSize: '1.5rem' }}>
                {mode === 'ADMIN' ? '🔑' : mode === 'STUDENT' ? '🎓' : '👨‍🏫'}
              </span>
              <strong style={{ fontSize: '1.1rem' }}>
                {mode === 'ADMIN' ? 'Admin Login' : mode === 'STUDENT' ? 'Student Login' : 'Professor Login'}
              </strong>
            </div>

            {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

            {mode === 'ADMIN' ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ background: '#ebf8ff', border: '1px solid #bee3f8', borderRadius: '8px',
                              padding: '14px', marginBottom: '16px', color: '#2c5282' }}>
                  ✅ Logging in as <strong>Library Admin</strong> — full access to all features.
                </div>
              </div>
            ) : loading ? (
              <p style={{ textAlign: 'center', color: '#718096' }}>Loading users...</p>
            ) : (
              <div className="form-group">
                <label>Select {mode === 'STUDENT' ? 'Student' : 'Professor'}</label>
                <select value={selId} onChange={e => setSelId(e.target.value)}>
                  <option value="">-- Choose --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.email}
                      {mode === 'STUDENT' ? ` (Sem ${u.semester})` : ` (${u.designation || ''})`}
                    </option>
                  ))}
                </select>
                {users.length === 0 && (
                  <p style={{ color: '#e53e3e', fontSize: '0.85rem', marginTop: '8px' }}>
                    No users found. Ask the Admin to add {mode === 'STUDENT' ? 'students' : 'professors'} first.
                  </p>
                )}
              </div>
            )}

            <button className="btn btn-primary" style={{ width: '100%', marginBottom: '10px' }}
              onClick={handleLogin}>
              Login →
            </button>
            <button className="btn" style={{ width: '100%', background: '#e2e8f0' }}
              onClick={() => { setMode(null); setError(''); }}>
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
