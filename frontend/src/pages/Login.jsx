<<<<<<< HEAD
import React, { useState } from 'react';
import { login } from '../services/api';
import Register      from './Register';
import ForgotPassword from './ForgotPassword';
import ResetPassword  from './ResetPassword';

function Login({ onLogin }) {
  const [view,     setView]     = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('token') ? 'reset' : 'login';
  });
  const [step,     setStep]     = useState('role');
  const [role,     setRole]     = useState(null);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const roleConfig = {
    ADMIN:   { icon:'🔑', label:'Admin',     desc:'Full system access',    color:'#fef3c7', border:'#f6ad55' },
    STUDENT: { icon:'🎓', label:'Student',   desc:'Borrow books & fines',  color:'#ebf8ff', border:'#63b3ed' },
    FACULTY: { icon:'👨‍🏫', label:'Professor', desc:'Extended borrow rights', color:'#faf5ff', border:'#b794f4' },
  };

  const selectRole = (r) => {
    setRole(r);
    setEmail(r === 'ADMIN' ? 'admin@library.com' : '');
    setPassword(''); setError(''); setStep('credentials');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { setError('Please enter email and password.'); return; }
    setLoading(true); setError('');
    try {
      const res = await login(email.trim(), password);
      const { token, userId, name, email: userEmail, role: userRole } = res.data;
      if (userRole !== role) {
        setError(`This account is registered as ${userRole}, not ${role}. Please select the correct role.`);
        setLoading(false); return;
      }
      localStorage.setItem('libraryToken', token);
      onLogin({ id: userId, name, email: userEmail, role: userRole });
    } catch (err) {
      const msg = err.response?.data || 'Login failed. Check your credentials.';
      setError(typeof msg === 'string' ? msg : 'Login failed.');
    } finally { setLoading(false); }
  };

  const cfg = role ? roleConfig[role] : null;

=======
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

>>>>>>> 60faa2c4c152355fe3b9d243f7e2a2107b30455d
  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">📚</div>
        <h1 className="login-title">UniLibrary</h1>
        <p className="login-sub">University Library Management System</p>

<<<<<<< HEAD
        {/* ── Register view ── */}
        {view === 'register' && <Register onBack={() => setView('login')} />}

        {/* ── Forgot password view ── */}
        {view === 'forgot' && <ForgotPassword onBack={() => setView('login')} />}

        {/* ── Reset password view (from email link) ── */}
        {view === 'reset' && <ResetPassword onBack={() => { window.history.replaceState({}, '', '/'); setView('login'); }} />}

        {/* ── Login view ── */}
        {view === 'login' && (
          <>
            {step === 'role' ? (
              <>
                <p style={{ color:'#4a5568', marginBottom:'20px', textAlign:'center', fontSize:'0.9rem' }}>
                  Select your role to continue
                </p>
                <div className="role-cards">
                  {Object.entries(roleConfig).map(([key, cfg]) => (
                    <div key={key} className="role-card" onClick={() => selectRole(key)}
                         style={{ borderColor:cfg.border, cursor:'pointer' }}>
                      <div className="role-icon">{cfg.icon}</div>
                      <div className="role-name">{cfg.label}</div>
                      <div style={{ fontSize:'0.75rem', color:'#718096', marginTop:'4px' }}>{cfg.desc}</div>
                    </div>
                  ))}
                </div>
                {/* Register link */}
                <div style={{ marginTop:'20px', textAlign:'center', borderTop:'1px solid #e2e8f0', paddingTop:'16px' }}>
                  <p style={{ color:'#718096', fontSize:'0.88rem', marginBottom:'8px' }}>New to UniLibrary?</p>
                  <button onClick={() => setView('register')}
                          style={{ background:'transparent', border:'1px solid #4299e1', color:'#4299e1',
                                   borderRadius:'8px', padding:'8px 20px', cursor:'pointer', fontWeight:600, fontSize:'0.88rem' }}>
                    📝 Register Now
                  </button>
                </div>
              </>
            ) : (
              <div style={{ width:'100%' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px',
                              background:cfg.color, border:`1px solid ${cfg.border}`,
                              borderRadius:'10px', padding:'10px 14px' }}>
                  <span style={{ fontSize:'1.4rem' }}>{cfg.icon}</span>
                  <div>
                    <div style={{ fontWeight:700, color:'#2d3748' }}>{cfg.label} Login</div>
                    <div style={{ fontSize:'0.78rem', color:'#718096' }}>{cfg.desc}</div>
                  </div>
                </div>

                {error && <div className="alert alert-error" style={{ marginBottom:'16px', borderRadius:'8px' }}>⚠️ {error}</div>}

                <form onSubmit={handleLogin} style={{ width:'100%' }}>
                  <div className="form-group" style={{ marginBottom:'14px' }}>
                    <label style={{ fontWeight:600, marginBottom:'6px', display:'block', color:'#4a5568' }}>Email Address</label>
                    <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                           placeholder={role==='ADMIN'?'admin@library.com':'your@email.com'}
                           style={{ width:'100%', padding:'10px 12px', borderRadius:'8px',
                                    border:'1px solid #e2e8f0', fontSize:'0.95rem', boxSizing:'border-box' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom:'8px' }}>
                    <label style={{ fontWeight:600, marginBottom:'6px', display:'block', color:'#4a5568' }}>Password</label>
                    <div style={{ position:'relative' }}>
                      <input type={showPwd?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                             placeholder="Enter your password"
                             style={{ width:'100%', padding:'10px 40px 10px 12px', borderRadius:'8px',
                                      border:'1px solid #e2e8f0', fontSize:'0.95rem', boxSizing:'border-box' }} />
                      <button type="button" onClick={()=>setShowPwd(v=>!v)}
                              style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)',
                                       background:'none', border:'none', cursor:'pointer', fontSize:'1rem', color:'#718096' }}>
                        {showPwd?'🙈':'👁️'}
                      </button>
                    </div>
                  </div>

                  {/* Forgot password link */}
                  <div style={{ textAlign:'right', marginBottom:'16px' }}>
                    <button type="button" onClick={() => setView('forgot')}
                            style={{ background:'none', border:'none', color:'#4299e1', cursor:'pointer',
                                     fontSize:'0.85rem', fontWeight:600, padding:0 }}>
                      Forgot password?
                    </button>
                  </div>

                  <button type="submit" className="btn btn-primary"
                          style={{ width:'100%', marginBottom:'10px', padding:'12px',
                                   fontSize:'1rem', fontWeight:600, borderRadius:'8px',
                                   opacity:loading?0.7:1, cursor:loading?'not-allowed':'pointer' }}
                          disabled={loading}>
                    {loading ? '⏳ Signing in...' : `Sign in as ${cfg.label} →`}
                  </button>
                </form>

                <button className="btn" onClick={()=>{setStep('role');setRole(null);setError('');}}
                        style={{ width:'100%', background:'#edf2f7', color:'#4a5568',
                                 borderRadius:'8px', padding:'10px', border:'none', cursor:'pointer' }}>
                  ← Change Role
                </button>
              </div>
            )}
          </>
        )}

        <p style={{ marginTop:'24px', color:'#a0aec0', fontSize:'0.75rem', textAlign:'center' }}>
          🔒 Secured with JWT Authentication
        </p>
=======
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
                
              </div>
              <div className="role-card" onClick={() => selectMode('FACULTY')}>
                <div className="role-icon">👨‍🏫</div>
                <div className="role-name">Professor</div>
            
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
>>>>>>> 60faa2c4c152355fe3b9d243f7e2a2107b30455d
      </div>
    </div>
  );
}

export default Login;
