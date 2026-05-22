// src/pages/ProfessorDashboard.jsx
import React, { useEffect, useState } from 'react';
import { getUserBorrows, getUnpaidFines, payFine, getBooks, searchBooks } from '../services/api';

/**
 * Personal dashboard for Professors/Faculty.
 * OOP: Shows same structure as StudentDashboard but with FACULTY-specific
 * borrow limits (10 books, 30 days, €0.50/day).
 * Demonstrates polymorphism in the UI too.
 */
function ProfessorDashboard({ user }) {
  const [borrows,  setBorrows]  = useState([]);
  const [fines,    setFines]    = useState([]);
  const [books,    setBooks]    = useState([]);
  const [search,   setSearch]   = useState('');
  const [msg,      setMsg]      = useState({ text: '', type: '' });
  const [tab,      setTab]      = useState('borrows');

  useEffect(() => { loadAll(); }, [user.id]);

  const loadAll = () => {
    getUserBorrows(user.id).then(r => setBorrows(r.data)).catch(() => {});
    getUnpaidFines(user.id).then(r => setFines(r.data)).catch(() => {});
    getBooks().then(r => setBooks(r.data)).catch(() => {});
  };

  const handleSearch = () => {
    if (!search.trim()) { getBooks().then(r => setBooks(r.data)); return; }
    searchBooks({ title: search }).then(r => setBooks(r.data)).catch(() => {});
  };

  const handlePay = (fineId) => {
    payFine(fineId)
      .then(() => { setMsg({ text: '✅ Fine paid!', type: 'success' }); loadAll(); })
      .catch(err => setMsg({ text: err.response?.data || 'Payment failed.', type: 'error' }));
  };

  const isOverdue = (d) => d && new Date(d) < new Date();
  const activeBorrows = borrows.filter(b => !b.returned);
  const totalFineOwed = fines.reduce((s, f) => s + f.totalAmount, 0);

  return (
    <div>
      <h1 className="page-title">👨‍🏫 Professor Dashboard</h1>

      {/* Welcome card — Faculty-specific limits */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #e9d8fd 100%)', border: '1px solid #d6bcfa' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ color: '#44337a', marginBottom: '4px' }}>Welcome, {user.name}! 👋</h2>
            <p style={{ color: '#4a5568' }}>{user.email}</p>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#553c9a' }}>{activeBorrows.length}/10</div>
              <div style={{ fontSize: '0.85rem', color: '#4a5568' }}>Books Borrowed</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: fines.length ? '#c53030' : '#38a169' }}>
                €{totalFineOwed.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#4a5568' }}>Fines Due</div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '14px', background: 'white', borderRadius: '8px', padding: '12px',
                      display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <span>📚 Max: <strong>10 books</strong></span>
          <span>📅 Duration: <strong>30 days</strong></span>
          <span>💶 Fine: <strong>€0.50/day</strong></span>
          <span style={{ color: '#c53030' }}>⚠️ Unpaid fines block borrowing</span>
        </div>
      </div>

      {msg.text && <div className={`alert ${msg.type === 'error' ? 'alert-error' : 'alert-success'}`}>{msg.text}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[['borrows', `📤 My Borrows (${activeBorrows.length} active)`],
          ['fines',   `💶 My Fines (${fines.length} unpaid)`],
          ['books',   '📖 Browse Books']].map(([key, label]) => (
          <button key={key} className={`btn ${tab === key ? 'btn-primary' : ''}`}
            style={tab !== key ? { background: '#e2e8f0' } : {}}
            onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      {tab === 'borrows' && (
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr><th>Book</th><th>Copy</th><th>Borrowed</th><th>Due Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {borrows.map(t => (
                <tr key={t.id}>
                  <td><strong>{t.bookCopy?.book?.title || '—'}</strong></td>
                  <td><code style={{ fontSize: '0.82rem' }}>{t.bookCopy?.copyCode}</code></td>
                  <td>{t.borrowDate}</td>
                  <td style={{ color: !t.returned && isOverdue(t.dueDate) ? '#e53e3e' : 'inherit' }}>
                    {t.dueDate}{!t.returned && isOverdue(t.dueDate) && ' ⚠️'}
                  </td>
                  <td>
                    {t.returned
                      ? <span className="badge badge-green">Returned</span>
                      : isOverdue(t.dueDate)
                        ? <span className="badge badge-red">Overdue</span>
                        : <span className="badge badge-yellow">Active</span>}
                  </td>
                </tr>
              ))}
              {borrows.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign:'center', color:'#718096', padding:'24px' }}>No borrow history yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'fines' && (
        <>
          {fines.length > 0 && (
            <div className="alert alert-error">
              ⚠️ {fines.length} unpaid fine(s) — total: <strong>€{totalFineOwed.toFixed(2)}</strong>
            </div>
          )}
          <div className="card" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr><th>Fine ID</th><th>Overdue Days</th><th>Rate</th><th>Total (€)</th><th>Date</th><th>Action</th></tr>
              </thead>
              <tbody>
                {fines.map(f => (
                  <tr key={f.id}>
                    <td>{f.id}</td>
                    <td>{f.overdueDays} days</td>
                    <td>€{f.fineAmountPerDay}</td>
                    <td><strong>€{f.totalAmount.toFixed(2)}</strong></td>
                    <td>{f.fineDate}</td>
                    <td><button className="btn btn-success btn-sm" onClick={() => handlePay(f.id)}>Pay Now</button></td>
                  </tr>
                ))}
                {fines.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign:'center', color:'#718096', padding:'24px' }}>🎉 No unpaid fines!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'books' && (
        <>
          <div className="search-bar">
            <input placeholder="Search by title..." value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            <button className="btn btn-primary" onClick={handleSearch}>Search</button>
            <button className="btn" style={{ background: '#e2e8f0' }}
              onClick={() => { setSearch(''); getBooks().then(r => setBooks(r.data)); }}>Reset</button>
          </div>
          <div className="card" style={{ padding: 0 }}>
            <table>
              <thead><tr><th>Title</th><th>Author</th><th>Genre</th><th>Year</th><th>Type</th></tr></thead>
              <tbody>
                {books.map(b => (
                  <tr key={b.id}>
                    <td><strong>{b.title}</strong></td>
                    <td>{b.author}</td>
                    <td>{b.genre || '—'}</td>
                    <td>{b.publishedYear || '—'}</td>
                    <td>{b.restrictedFromRemoval
                      ? <span className="badge badge-red">In-Library</span>
                      : <span className="badge badge-green">Can Borrow</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default ProfessorDashboard;
