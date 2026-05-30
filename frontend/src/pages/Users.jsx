<<<<<<< HEAD
// src/pages/Users.jsx  — v2: includes password field for registration
import React, { useState, useEffect } from 'react';
import { getStudents, getFaculty, deleteUser, registerStudent, registerFaculty } from '../services/api';
=======
// src/pages/Users.jsx
// FIX: Removed password field — not needed for library management demo.
import React, { useState, useEffect } from 'react';
import { getStudents, getFaculty, addStudent, addFaculty, deleteUser } from '../services/api';
>>>>>>> 60faa2c4c152355fe3b9d243f7e2a2107b30455d

function Users() {
  const [students, setStudents] = useState([]);
  const [faculty,  setFaculty]  = useState([]);
  const [tab,      setTab]      = useState('students');
  const [showForm, setShowForm] = useState(false);
<<<<<<< HEAD
  const [showPwd,  setShowPwd]  = useState(false);
  const [msg,      setMsg]      = useState({ text: '', type: '' });

  const emptyStudent = { name: '', email: '', phone: '', password: '', studentId: '', department: '', semester: 1 };
  const emptyFaculty = { name: '', email: '', phone: '', password: '', employeeId: '', department: '', designation: '' };
=======
  const [msg,      setMsg]      = useState({ text: '', type: '' });

  // FIX: no 'password' field
  const emptyStudent = { name: '', email: '', phone: '', studentId: '', department: '', semester: 1 };
  const emptyFaculty = { name: '', email: '', phone: '', employeeId: '', department: '', designation: '' };
>>>>>>> 60faa2c4c152355fe3b9d243f7e2a2107b30455d
  const [form, setForm] = useState(emptyStudent);

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    getStudents().then(r => setStudents(r.data)).catch(() => {});
    getFaculty().then(r => setFaculty(r.data)).catch(() => {});
  };

  const openAdd = () => {
    setForm(tab === 'students' ? emptyStudent : emptyFaculty);
    setMsg({ text: '', type: '' });
<<<<<<< HEAD
    setShowPwd(false);
=======
>>>>>>> 60faa2c4c152355fe3b9d243f7e2a2107b30455d
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
<<<<<<< HEAD
    if (!form.password || form.password.length < 6) {
      setMsg({ text: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }
    const action = tab === 'students' ? registerStudent(form) : registerFaculty(form);
=======
    const action = tab === 'students' ? addStudent(form) : addFaculty(form);
>>>>>>> 60faa2c4c152355fe3b9d243f7e2a2107b30455d
    action
      .then(() => {
        setShowForm(false);
        loadData();
<<<<<<< HEAD
        setMsg({ text: `✅ ${tab === 'students' ? 'Student' : 'Faculty'} added successfully!`, type: 'success' });
=======
        setMsg({ text: '✅ User added successfully!', type: 'success' });
>>>>>>> 60faa2c4c152355fe3b9d243f7e2a2107b30455d
      })
      .catch(err => setMsg({ text: err.response?.data || 'Error adding user.', type: 'error' }));
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this user? Their borrow history will also be deleted.')) return;
    deleteUser(id)
      .then(() => { loadData(); setMsg({ text: '✅ User deleted.', type: 'success' }); })
      .catch(err => setMsg({ text: err.response?.data || 'Delete failed.', type: 'error' }));
  };

  const f = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div>
      <h1 className="page-title">👥 Users</h1>

      {msg.text && (
        <div className={`alert ${msg.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          {msg.text}
        </div>
      )}

      {/* Tab buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
<<<<<<< HEAD
        <button className={`btn ${tab === 'students' ? 'btn-primary' : ''}`}
=======
        <button
          className={`btn ${tab === 'students' ? 'btn-primary' : ''}`}
>>>>>>> 60faa2c4c152355fe3b9d243f7e2a2107b30455d
          style={tab !== 'students' ? { background: '#e2e8f0' } : {}}
          onClick={() => setTab('students')}>
          🎓 Students ({students.length})
        </button>
<<<<<<< HEAD
        <button className={`btn ${tab === 'faculty' ? 'btn-primary' : ''}`}
=======
        <button
          className={`btn ${tab === 'faculty' ? 'btn-primary' : ''}`}
>>>>>>> 60faa2c4c152355fe3b9d243f7e2a2107b30455d
          style={tab !== 'faculty' ? { background: '#e2e8f0' } : {}}
          onClick={() => setTab('faculty')}>
          👨‍🏫 Faculty ({faculty.length})
        </button>
        <button className="btn btn-success" onClick={openAdd} style={{ marginLeft: 'auto' }}>
          + Add {tab === 'students' ? 'Student' : 'Faculty'}
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            {tab === 'students' ? (
              <tr><th>ID</th><th>Name</th><th>Student ID</th><th>Email</th><th>Phone</th><th>Department</th><th>Sem</th><th>Action</th></tr>
            ) : (
              <tr><th>ID</th><th>Name</th><th>Emp ID</th><th>Email</th><th>Phone</th><th>Department</th><th>Designation</th><th>Action</th></tr>
            )}
          </thead>
          <tbody>
            {(tab === 'students' ? students : faculty).map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td><strong>{u.name}</strong></td>
                <td>{tab === 'students' ? u.studentId : u.employeeId}</td>
                <td>{u.email}</td>
                <td>{u.phone || '—'}</td>
                <td>{u.department || '—'}</td>
                <td>{tab === 'students' ? `Sem ${u.semester}` : u.designation}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {(tab === 'students' ? students : faculty).length === 0 && (
<<<<<<< HEAD
              <tr><td colSpan={8} style={{ textAlign: 'center', color: '#718096', padding: '24px' }}>
                No {tab} added yet.
              </td></tr>
=======
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: '#718096', padding: '24px' }}>
                  No {tab} added yet.
                </td>
              </tr>
>>>>>>> 60faa2c4c152355fe3b9d243f7e2a2107b30455d
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              Add {tab === 'students' ? '🎓 Student' : '👨‍🏫 Faculty'}
            </div>

<<<<<<< HEAD
            {msg.text && msg.type === 'error' && (
              <div className="alert alert-error" style={{ marginBottom: '12px' }}>{msg.text}</div>
            )}

=======
>>>>>>> 60faa2c4c152355fe3b9d243f7e2a2107b30455d
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input required value={form.name} onChange={f('name')} placeholder="e.g. Rahul Sharma" />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input required type="email" value={form.email} onChange={f('email')} placeholder="e.g. rahul@uni.edu" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input value={form.phone || ''} onChange={f('phone')} placeholder="e.g. 9876543210" />
                </div>
                <div className="form-group">
<<<<<<< HEAD
                  <label>Password * <span style={{ color: '#718096', fontWeight: 400, fontSize: '0.8rem' }}>(min 6 chars)</span></label>
                  <div style={{ position: 'relative' }}>
                    <input required type={showPwd ? 'text' : 'password'}
                      value={form.password} onChange={f('password')}
                      placeholder="Set login password"
                      style={{ paddingRight: '36px', width: '100%', boxSizing: 'border-box' }} />
                    <button type="button" onClick={() => setShowPwd(v => !v)}
                      style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                               background: 'none', border: 'none', cursor: 'pointer' }}>
                      {showPwd ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Department</label>
                  <input value={form.department || ''} onChange={f('department')} placeholder="e.g. Computer Science" />
                </div>
                {tab === 'students' ? (
=======
                  <label>Department</label>
                  <input value={form.department || ''} onChange={f('department')} placeholder="e.g. Computer Science" />
                </div>
              </div>

              {tab === 'students' ? (
                <div className="form-row">
>>>>>>> 60faa2c4c152355fe3b9d243f7e2a2107b30455d
                  <div className="form-group">
                    <label>Student ID *</label>
                    <input required value={form.studentId || ''} onChange={f('studentId')} placeholder="e.g. STU2024001" />
                  </div>
<<<<<<< HEAD
                ) : (
=======
                  <div className="form-group">
                    <label>Semester (1–8)</label>
                    <input type="number" min="1" max="8" value={form.semester || 1}
                      onChange={e => setForm({ ...form, semester: parseInt(e.target.value) })} />
                  </div>
                </div>
              ) : (
                <div className="form-row">
>>>>>>> 60faa2c4c152355fe3b9d243f7e2a2107b30455d
                  <div className="form-group">
                    <label>Employee ID *</label>
                    <input required value={form.employeeId || ''} onChange={f('employeeId')} placeholder="e.g. FAC2024001" />
                  </div>
<<<<<<< HEAD
                )}
              </div>

              {tab === 'students' ? (
                <div className="form-group">
                  <label>Semester (1–8)</label>
                  <input type="number" min="1" max="8" value={form.semester || 1}
                    onChange={e => setForm({ ...form, semester: parseInt(e.target.value) })} />
                </div>
              ) : (
                <div className="form-group">
                  <label>Designation</label>
                  <input value={form.designation || ''} onChange={f('designation')} placeholder="e.g. Associate Professor" />
=======
                  <div className="form-group">
                    <label>Designation</label>
                    <input value={form.designation || ''} onChange={f('designation')} placeholder="e.g. Professor" />
                  </div>
>>>>>>> 60faa2c4c152355fe3b9d243f7e2a2107b30455d
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn" style={{ background: '#e2e8f0' }}
                  onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  Add {tab === 'students' ? 'Student' : 'Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
