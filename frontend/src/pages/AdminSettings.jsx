import React, { useState } from 'react';
import { adminChangePassword, createAdmin } from '../services/api';

function AdminSettings({ user }) {
  const [tab, setTab] = useState('change-pwd');

  // Change own password
  const [cpForm,    setCpForm]    = useState({ oldPassword:'', newPassword:'', confirm:'' });
  const [cpLoading, setCpLoading] = useState(false);
  const [cpMsg,     setCpMsg]     = useState(null);

  // Force-change any user's password
  const [fcForm,    setFcForm]    = useState({ email:'', newPassword:'', confirm:'' });
  const [fcLoading, setFcLoading] = useState(false);
  const [fcMsg,     setFcMsg]     = useState(null);

  // Create admin
  const [caForm,    setCaForm]    = useState({ name:'', email:'', phone:'', password:'', confirm:'' });
  const [caLoading, setCaLoading] = useState(false);
  const [caMsg,     setCaMsg]     = useState(null);

  const handleChangePwd = async (e) => {
    e.preventDefault();
    if (cpForm.newPassword !== cpForm.confirm) { setCpMsg({ type:'error', text:"Passwords don't match." }); return; }
    setCpLoading(true); setCpMsg(null);
    try {
      const { changePassword } = await import('../services/api');
      await changePassword(user.email, cpForm.oldPassword, cpForm.newPassword);
      setCpMsg({ type:'success', text:'✅ Password changed successfully!' });
      setCpForm({ oldPassword:'', newPassword:'', confirm:'' });
    } catch (err) {
      setCpMsg({ type:'error', text: err.response?.data || 'Failed to change password.' });
    } finally { setCpLoading(false); }
  };

  const handleForceChange = async (e) => {
    e.preventDefault();
    if (fcForm.newPassword !== fcForm.confirm) { setFcMsg({ type:'error', text:"Passwords don't match." }); return; }
    setFcLoading(true); setFcMsg(null);
    try {
      await adminChangePassword(fcForm.email, fcForm.newPassword);
      setFcMsg({ type:'success', text:`✅ Password updated for ${fcForm.email}` });
      setFcForm({ email:'', newPassword:'', confirm:'' });
    } catch (err) {
      setFcMsg({ type:'error', text: err.response?.data || 'Failed to update password.' });
    } finally { setFcLoading(false); }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (caForm.password !== caForm.confirm) { setCaMsg({ type:'error', text:"Passwords don't match." }); return; }
    setCaLoading(true); setCaMsg(null);
    try {
      await createAdmin({ name:caForm.name, email:caForm.email, phone:caForm.phone, password:caForm.password });
      setCaMsg({ type:'success', text:`✅ Admin account created for ${caForm.name}! Welcome email sent.` });
      setCaForm({ name:'', email:'', phone:'', password:'', confirm:'' });
    } catch (err) {
      setCaMsg({ type:'error', text: err.response?.data || 'Failed to create admin.' });
    } finally { setCaLoading(false); }
  };

  const inputStyle = { width:'100%', padding:'10px 12px', borderRadius:'8px',
    border:'1px solid #e2e8f0', fontSize:'0.9rem', boxSizing:'border-box', marginBottom:'12px' };
  const labelStyle = { fontWeight:600, color:'#4a5568', display:'block', marginBottom:'4px', fontSize:'0.85rem' };
  const msgStyle   = (type) => ({
    padding:'10px 14px', borderRadius:'8px', marginBottom:'12px', fontSize:'0.88rem',
    background: type==='success'?'#f0fff4':'#fff5f5',
    border: `1px solid ${type==='success'?'#9ae6b4':'#feb2b2'}`,
    color: type==='success'?'#276749':'#c53030'
  });

  const tabs = [
    { key:'change-pwd',   label:'🔒 My Password' },
    { key:'force-change', label:'🛠️ Change Any Password' },
    { key:'create-admin', label:'👑 Create Admin' },
  ];

  return (
    <div>
      <h2 style={{ color:'#2d3748', marginBottom:'4px' }}>⚙️ Admin Settings</h2>
      <p style={{ color:'#718096', marginBottom:'24px', fontSize:'0.9rem' }}>
        Manage passwords and admin accounts
      </p>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'24px', flexWrap:'wrap' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
                  style={{ padding:'8px 16px', borderRadius:'8px', border:'none', cursor:'pointer',
                           fontWeight:600, fontSize:'0.88rem',
                           background: tab===t.key ? '#4299e1' : '#edf2f7',
                           color:      tab===t.key ? '#fff'    : '#4a5568' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ background:'#fff', borderRadius:'12px', padding:'24px',
                    boxShadow:'0 1px 3px rgba(0,0,0,0.1)', maxWidth:'480px' }}>

        {/* ── My Password ── */}
        {tab === 'change-pwd' && (
          <form onSubmit={handleChangePwd}>
            <h3 style={{ color:'#2d3748', marginBottom:'16px' }}>Change My Password</h3>
            {cpMsg && <div style={msgStyle(cpMsg.type)}>{cpMsg.text}</div>}
            <label style={labelStyle}>Current Password</label>
            <input type="password" style={inputStyle} required value={cpForm.oldPassword}
                   onChange={e=>setCpForm(f=>({...f,oldPassword:e.target.value}))} placeholder="Current password" />
            <label style={labelStyle}>New Password</label>
            <input type="password" style={inputStyle} required value={cpForm.newPassword}
                   onChange={e=>setCpForm(f=>({...f,newPassword:e.target.value}))} placeholder="New password" />
            <label style={labelStyle}>Confirm New Password</label>
            <input type="password" style={inputStyle} required value={cpForm.confirm}
                   onChange={e=>setCpForm(f=>({...f,confirm:e.target.value}))} placeholder="Repeat new password" />
            <button type="submit" className="btn btn-primary"
                    style={{ width:'100%', padding:'11px', borderRadius:'8px', fontWeight:600,
                             opacity:cpLoading?0.7:1 }} disabled={cpLoading}>
              {cpLoading ? '⏳ Updating...' : '🔒 Update Password'}
            </button>
          </form>
        )}

        {/* ── Force Change ── */}
        {tab === 'force-change' && (
          <form onSubmit={handleForceChange}>
            <h3 style={{ color:'#2d3748', marginBottom:'16px' }}>Change Any User's Password</h3>
            {fcMsg && <div style={msgStyle(fcMsg.type)}>{fcMsg.text}</div>}
            <label style={labelStyle}>User Email</label>
            <input type="email" style={inputStyle} required value={fcForm.email}
                   onChange={e=>setFcForm(f=>({...f,email:e.target.value}))} placeholder="user@email.com" />
            <label style={labelStyle}>New Password</label>
            <input type="password" style={inputStyle} required value={fcForm.newPassword}
                   onChange={e=>setFcForm(f=>({...f,newPassword:e.target.value}))} placeholder="New password" />
            <label style={labelStyle}>Confirm Password</label>
            <input type="password" style={inputStyle} required value={fcForm.confirm}
                   onChange={e=>setFcForm(f=>({...f,confirm:e.target.value}))} placeholder="Repeat password" />
            <button type="submit" className="btn btn-primary"
                    style={{ width:'100%', padding:'11px', borderRadius:'8px', fontWeight:600,
                             opacity:fcLoading?0.7:1 }} disabled={fcLoading}>
              {fcLoading ? '⏳ Updating...' : '🛠️ Update Password'}
            </button>
          </form>
        )}

        {/* ── Create Admin ── */}
        {tab === 'create-admin' && (
          <form onSubmit={handleCreateAdmin}>
            <h3 style={{ color:'#2d3748', marginBottom:'16px' }}>Create New Admin Account</h3>
            {caMsg && <div style={msgStyle(caMsg.type)}>{caMsg.text}</div>}
            <label style={labelStyle}>Full Name</label>
            <input style={inputStyle} required value={caForm.name}
                   onChange={e=>setCaForm(f=>({...f,name:e.target.value}))} placeholder="Admin Name" />
            <label style={labelStyle}>Email Address</label>
            <input type="email" style={inputStyle} required value={caForm.email}
                   onChange={e=>setCaForm(f=>({...f,email:e.target.value}))} placeholder="admin@library.com" />
            <label style={labelStyle}>Phone</label>
            <input style={inputStyle} value={caForm.phone}
                   onChange={e=>setCaForm(f=>({...f,phone:e.target.value}))} placeholder="Optional" />
            <label style={labelStyle}>Password</label>
            <input type="password" style={inputStyle} required value={caForm.password}
                   onChange={e=>setCaForm(f=>({...f,password:e.target.value}))} placeholder="Min 6 characters" />
            <label style={labelStyle}>Confirm Password</label>
            <input type="password" style={inputStyle} required value={caForm.confirm}
                   onChange={e=>setCaForm(f=>({...f,confirm:e.target.value}))} placeholder="Repeat password" />
            <button type="submit" className="btn btn-primary"
                    style={{ width:'100%', padding:'11px', borderRadius:'8px', fontWeight:600,
                             opacity:caLoading?0.7:1 }} disabled={caLoading}>
              {caLoading ? '⏳ Creating...' : '👑 Create Admin Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AdminSettings;
