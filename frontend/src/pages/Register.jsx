import React, { useState } from 'react';
import { registerStudent, registerFaculty } from '../services/api';

function Register({ onBack }) {
  const [role, setRole]         = useState(null);
  const [form, setForm]         = useState({});
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState('');
  const [error, setError]       = useState('');

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError("Passwords don't match."); return; }
    setLoading(true); setError('');
    try {
      if (role === 'STUDENT') await registerStudent(form);
      else await registerFaculty(form);
      setSuccess(`✅ Registration successful! Check your email for a welcome message. You can now log in.`);
    } catch (err) {
      setError(err.response?.data || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const inputStyle = { width:'100%', padding:'10px 12px', borderRadius:'8px',
    border:'1px solid #e2e8f0', fontSize:'0.95rem', boxSizing:'border-box', marginBottom:'12px' };
  const labelStyle = { fontWeight:600, color:'#4a5568', display:'block', marginBottom:'4px', fontSize:'0.88rem' };

  if (success) return (
    <div style={{ textAlign:'center', padding:'20px' }}>
      <div style={{ fontSize:'3rem', marginBottom:'16px' }}>🎉</div>
      <p style={{ color:'#38a169', fontWeight:600, marginBottom:'20px' }}>{success}</p>
      <button onClick={onBack} className="btn btn-primary" style={{ padding:'10px 24px', borderRadius:'8px' }}>
        Go to Login →
      </button>
    </div>
  );

  if (!role) return (
    <div>
      <p style={{ color:'#4a5568', textAlign:'center', marginBottom:'20px', fontSize:'0.9rem' }}>
        Select your role to register
      </p>
      <div className="role-cards">
        {[
          { key:'STUDENT', icon:'🎓', label:'Student',  desc:'Register as a student' },
          { key:'FACULTY', icon:'👨‍🏫', label:'Faculty', desc:'Register as faculty' },
        ].map(r => (
          <div key={r.key} className="role-card" onClick={() => setRole(r.key)}
               style={{ borderColor: r.key==='STUDENT'?'#63b3ed':'#b794f4', cursor:'pointer' }}>
            <div className="role-icon">{r.icon}</div>
            <div className="role-name">{r.label}</div>
            <div style={{ fontSize:'0.75rem', color:'#718096', marginTop:'4px' }}>{r.desc}</div>
          </div>
        ))}
      </div>
      <button onClick={onBack} style={{ width:'100%', marginTop:'16px', background:'#edf2f7',
        color:'#4a5568', border:'none', borderRadius:'8px', padding:'10px', cursor:'pointer' }}>
        ← Back to Login
      </button>
    </div>
  );

  return (
    <div style={{ width:'100%' }}>
      <h3 style={{ textAlign:'center', color:'#2d3748', marginBottom:'16px' }}>
        {role === 'STUDENT' ? '🎓 Student' : '👨‍🏫 Faculty'} Registration
      </h3>
      {error && <div className="alert alert-error" style={{ marginBottom:'12px', borderRadius:'8px' }}>⚠️ {error}</div>}
      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>Full Name *</label>
        <input style={inputStyle} required placeholder="John Doe" onChange={e=>update('name',e.target.value)} />
        <label style={labelStyle}>Email Address *</label>
        <input style={inputStyle} type="email" required placeholder="you@university.edu" onChange={e=>update('email',e.target.value)} />
        <label style={labelStyle}>Phone</label>
        <input style={inputStyle} placeholder="+1 234 567 8900" onChange={e=>update('phone',e.target.value)} />

        {role === 'STUDENT' ? (<>
          <label style={labelStyle}>Student ID *</label>
          <input style={inputStyle} required placeholder="STU-2024-001" onChange={e=>update('studentId',e.target.value)} />
          <label style={labelStyle}>Department *</label>
          <input style={inputStyle} required placeholder="Computer Science" onChange={e=>update('department',e.target.value)} />
          <label style={labelStyle}>Semester *</label>
          <input style={inputStyle} type="number" required min="1" max="12" placeholder="3" onChange={e=>update('semester',parseInt(e.target.value))} />
        </>) : (<>
          <label style={labelStyle}>Employee ID *</label>
          <input style={inputStyle} required placeholder="FAC-001" onChange={e=>update('employeeId',e.target.value)} />
          <label style={labelStyle}>Department *</label>
          <input style={inputStyle} required placeholder="Computer Science" onChange={e=>update('department',e.target.value)} />
          <label style={labelStyle}>Designation *</label>
          <input style={inputStyle} required placeholder="Associate Professor" onChange={e=>update('designation',e.target.value)} />
        </>)}

        <label style={labelStyle}>Password *</label>
        <input style={inputStyle} type="password" required placeholder="Min 6 characters" onChange={e=>update('password',e.target.value)} />
        <label style={labelStyle}>Confirm Password *</label>
        <input style={inputStyle} type="password" required placeholder="Repeat password" onChange={e=>update('confirmPassword',e.target.value)} />

        <button type="submit" className="btn btn-primary"
                style={{ width:'100%', padding:'12px', borderRadius:'8px', fontSize:'1rem',
                         fontWeight:600, opacity:loading?0.7:1, cursor:loading?'not-allowed':'pointer' }}
                disabled={loading}>
          {loading ? '⏳ Registering...' : `Register as ${role === 'STUDENT' ? 'Student' : 'Faculty'} →`}
        </button>
      </form>
      <button onClick={() => { setRole(null); setError(''); }}
              style={{ width:'100%', marginTop:'10px', background:'#edf2f7', color:'#4a5568',
                       border:'none', borderRadius:'8px', padding:'10px', cursor:'pointer' }}>
        ← Change Role
      </button>
    </div>
  );
}

export default Register;
