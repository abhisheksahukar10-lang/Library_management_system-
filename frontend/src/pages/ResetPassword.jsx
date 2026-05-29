import React, { useState, useEffect } from 'react';
import { resetPassword } from '../services/api';

function ResetPassword({ onBack }) {
  const [token,    setToken]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState('');
  const [error,    setError]    = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (t) setToken(t);
    else setError('No reset token found. Please use the link from your email.');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 6)  { setError("Password must be at least 6 characters."); return; }
    setLoading(true); setError('');
    try {
      await resetPassword(token, password);
      setSuccess('✅ Password reset successfully! You can now log in with your new password.');
    } catch (err) {
      setError(err.response?.data || 'Reset failed. The link may be expired.');
    } finally { setLoading(false); }
  };

  const inputStyle = { width:'100%', padding:'10px 12px', borderRadius:'8px',
    border:'1px solid #e2e8f0', fontSize:'0.95rem', boxSizing:'border-box', marginBottom:'14px' };

  return (
    <div style={{ width:'100%' }}>
      <div style={{ textAlign:'center', marginBottom:'20px' }}>
        <div style={{ fontSize:'2.5rem' }}>🔑</div>
        <h3 style={{ color:'#2d3748', margin:'8px 0 4px' }}>Reset Password</h3>
        <p style={{ color:'#718096', fontSize:'0.88rem' }}>Enter your new password below</p>
      </div>

      {success ? (
        <div>
          <div style={{ background:'#f0fff4', border:'1px solid #9ae6b4', borderRadius:'8px',
                        padding:'16px', color:'#276749', marginBottom:'16px', textAlign:'center' }}>
            {success}
          </div>
          <button onClick={onBack} className="btn btn-primary"
                  style={{ width:'100%', padding:'12px', borderRadius:'8px', fontWeight:600 }}>
            Go to Login →
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error" style={{ marginBottom:'12px', borderRadius:'8px' }}>⚠️ {error}</div>}
          <label style={{ fontWeight:600, color:'#4a5568', display:'block', marginBottom:'4px', fontSize:'0.88rem' }}>
            New Password
          </label>
          <input type="password" required value={password} onChange={e=>setPassword(e.target.value)}
                 placeholder="Min 6 characters" style={inputStyle} />
          <label style={{ fontWeight:600, color:'#4a5568', display:'block', marginBottom:'4px', fontSize:'0.88rem' }}>
            Confirm Password
          </label>
          <input type="password" required value={confirm} onChange={e=>setConfirm(e.target.value)}
                 placeholder="Repeat new password" style={inputStyle} />
          <button type="submit" className="btn btn-primary"
                  style={{ width:'100%', padding:'12px', borderRadius:'8px', fontSize:'1rem',
                           fontWeight:600, opacity:loading?0.7:1, cursor:loading?'not-allowed':'pointer' }}
                  disabled={loading || !token}>
            {loading ? '⏳ Resetting...' : '🔑 Reset Password'}
          </button>
        </form>
      )}
    </div>
  );
}

export default ResetPassword;
