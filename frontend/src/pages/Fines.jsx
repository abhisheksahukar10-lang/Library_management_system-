// src/pages/Fines.jsx  — Admin view. Fines in EUR (€).
import React, { useState, useEffect } from 'react';
import { getUserFines, payFine, getStudents, getFaculty } from '../services/api';

function Fines() {
  const [users,  setUsers]  = useState([]);
  const [userId, setUserId] = useState('');
  const [fines,  setFines]  = useState([]);
  const [msg,    setMsg]    = useState({ text: '', type: '' });

  useEffect(() => {
    Promise.all([getStudents(), getFaculty()])
      .then(([s, f]) => setUsers([...s.data, ...f.data]));
  }, []);

  const loadFines = (uid) => {
    if (!uid) return;
    getUserFines(uid).then(r => setFines(r.data));
  };

  const handlePay = (fineId) => {
    payFine(fineId)
      .then(() => { setMsg({ text: '✅ Fine marked as paid!', type: 'success' }); loadFines(userId); })
      .catch(err => setMsg({ text: err.response?.data || 'Error', type: 'error' }));
  };

  const totalUnpaid = fines.filter(f => !f.paid).reduce((s, f) => s + f.totalAmount, 0);

  return (
    <div>
      <h1 className="page-title">💶 Fines</h1>

      {msg.text && (
        <div className={`alert ${msg.type === 'error' ? 'alert-error' : 'alert-success'}`}>{msg.text}</div>
      )}

      <div className="card">
        <div className="form-group" style={{ maxWidth: '400px' }}>
          <label>Select User to View Fines</label>
          <select value={userId} onChange={e => { setUserId(e.target.value); loadFines(e.target.value); }}>
            <option value="">-- Choose User --</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} — {u.email}</option>
            ))}
          </select>
        </div>
      </div>

      {userId && (
        <>
          {totalUnpaid > 0 && (
            <div className="alert alert-error">
              ⚠️ Total unpaid fines: <strong>€{totalUnpaid.toFixed(2)}</strong>
            </div>
          )}
          {totalUnpaid === 0 && fines.length > 0 && (
            <div className="alert alert-success">✅ All fines paid for this user.</div>
          )}

          <div className="card" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Fine ID</th><th>Overdue Days</th>
                  <th>Rate (€/day)</th><th>Total (€)</th>
                  <th>Fine Date</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {fines.map(f => (
                  <tr key={f.id}>
                    <td>{f.id}</td>
                    <td>{f.overdueDays} days</td>
                    <td>€{f.fineAmountPerDay.toFixed(2)}</td>
                    <td><strong>€{f.totalAmount.toFixed(2)}</strong></td>
                    <td>{f.fineDate}</td>
                    <td>
                      {f.paid
                        ? <span className="badge badge-green">Paid ✓</span>
                        : <span className="badge badge-red">Unpaid</span>
                      }
                    </td>
                    <td>
                      {!f.paid && (
                        <button className="btn btn-success btn-sm" onClick={() => handlePay(f.id)}>
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {fines.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign:'center', color:'#718096', padding:'24px' }}>
                    No fines found for this user. 🎉
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default Fines;
