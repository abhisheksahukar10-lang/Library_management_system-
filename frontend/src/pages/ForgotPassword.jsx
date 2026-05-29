import React, { useState } from 'react';
import { forgotPassword } from '../services/api';

function ForgotPassword({ onBack }) {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await forgotPassword(email.trim());
      setSuccess('📧 If that email is registered, a reset link has been sent. Check your inbox (and spam folder).');
    } catch (err) {
      setError(err.response?.data || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ width:'100%' }}>
      <div style={{ textAlign:'center', marginBottom:'20px' }}>
        <div style={{ fontSize:'2.5rem' }}>🔐</div>
        <h3 style={{ color:'#2d3748', margin:'8px 0 4px' }}>Forgot Password</h3>
        <p style={{ color:'#718096', fontSize:'0.88rem' }}>Enter your email to receive a reset link</p>
      </div>

      {success ? (
        <div>
          <div style={{ background:'#f0fff4', border:'1px solid #9ae6b4', borderRadius:'8px',
                        padding:'16px', color:'#276749', marginBottom:'16px', textAlign:'center' }}>
            {success}
          </div>
          <button onClick={onBack} className="btn btn-primary"
                  style={{ width:'100%', padding:'12px', borderRadius:'8px', fontWeight:600 }}>
            ← Back to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error" style={{ marginBottom:'12px', borderRadius:'8px' }}>⚠️ {error}</div>}
          <label style={{ fontWeight:600, color:'#4a5568', display:'block', marginBottom:'6px', fontSize:'0.88rem' }}>
            Email Address
          </label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                 placeholder="your@email.com"
                 style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #e2e8f0',
                          fontSize:'0.95rem', boxSizing:'border-box', marginBottom:'16px' }} />
          <button type="submit" className="btn btn-primary"
                  style={{ width:'100%', padding:'12px', borderRadius:'8px', fontSize:'1rem',
                           fontWeight:600, opacity:loading?0.7:1, cursor:loading?'not-allowed':'pointer' }}
                  disabled={loading}>
            {loading ? '⏳ Sending...' : '📧 Send Reset Link'}
          </button>
          <button type="button" onClick={onBack}
                  style={{ width:'100%', marginTop:'10px', background:'#edf2f7', color:'#4a5568',
                           border:'none', borderRadius:'8px', padding:'10px', cursor:'pointer' }}>
            ← Back to Login
          </button>
        </form>
      )}
    </div>
  );
}

export default ForgotPassword;
