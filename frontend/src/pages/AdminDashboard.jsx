// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { getBooks, getStudents, getFaculty, getOverdue } from '../services/api';

function AdminDashboard() {
  const [stats,   setStats]   = useState({ books: 0, students: 0, faculty: 0, overdue: 0 });
  const [overdueList, setOverdueList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getBooks(), getStudents(), getFaculty(), getOverdue()])
      .then(([b, s, f, o]) => {
        setStats({ books: b.data.length, students: s.data.length, faculty: f.data.length, overdue: o.data.length });
        setOverdueList(o.data.slice(0, 8)); // show latest 8
      })
      .catch(err => console.error('Dashboard load error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: '#718096' }}>Loading dashboard...</p>;

  return (
    <div>
      <h1 className="page-title">🔑 Admin Dashboard</h1>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.books}</div>
          <div className="stat-label">📖 Total Books</div>
        </div>
        <div className="stat-card green">
          <div className="stat-number">{stats.students}</div>
          <div className="stat-label">🎓 Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.faculty}</div>
          <div className="stat-label">👨‍🏫 Faculty</div>
        </div>
        <div className="stat-card red">
          <div className="stat-number">{stats.overdue}</div>
          <div className="stat-label">⚠️ Overdue</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Borrow Policy */}
        <div className="card">
          <h3 style={{ marginBottom: '14px', color: '#2c5282' }}>📋 Borrow Policies</h3>
          <table>
            <thead>
              <tr><th>Role</th><th>Max Books</th><th>Duration</th><th>Fine/Day</th></tr>
            </thead>
            <tbody>
              <tr><td>🎓 Student</td><td>3</td><td>14 days</td><td>€1.00</td></tr>
              <tr><td>👨‍🏫 Professor</td><td>10</td><td>30 days</td><td>€0.50</td></tr>
            </tbody>
          </table>
        </div>

        {/* Quick links */}
        <div className="card">
          <h3 style={{ marginBottom: '14px', color: '#2c5282' }}>⚡ Quick Actions</h3>
          <ul style={{ paddingLeft: '20px', lineHeight: '2.2' }}>
            <li><strong>Books</strong> — Add books, manage copies (📋 Copies button)</li>
            <li><strong>Users</strong> — Add students &amp; professors</li>
            <li><strong>Borrow</strong> — Issue and return books</li>
            <li><strong>Fines</strong> — View and clear overdue fines (€)</li>
            <li><strong>Chatbot</strong> — Query book availability</li>
          </ul>
        </div>
      </div>

      {/* Overdue List */}
      {overdueList.length > 0 && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ background: '#fed7d7', color: '#c53030', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
              ⚠️ {stats.overdue} Overdue
            </span>
            <strong>Overdue Transactions</strong>
          </div>
          <table>
            <thead>
              <tr><th>TX ID</th><th>Borrower</th><th>Book Copy</th><th>Due Date</th></tr>
            </thead>
            <tbody>
              {overdueList.map(t => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.borrower?.name}</td>
                  <td><code>{t.bookCopy?.copyCode}</code></td>
                  <td style={{ color: '#e53e3e', fontWeight: 600 }}>{t.dueDate} ⚠️</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
