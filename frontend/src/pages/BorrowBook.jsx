// src/pages/BorrowBook.jsx
// FIX: u.getUserType() doesn't work on plain JSON — fixed label logic.
// Also shows book title in borrow history, not just copy code.
import React, { useState, useEffect } from 'react';
import { borrowBook, returnBook, getUserBorrows, getStudents, getFaculty, getBooks } from '../services/api';

function BorrowBook() {
  const [users,        setUsers]        = useState([]);
  const [books,        setBooks]        = useState([]);
  const [userId,       setUserId]       = useState('');
  const [bookId,       setBookId]       = useState('');
  const [transactions, setTransactions] = useState([]);
  const [msg,          setMsg]          = useState({ text: '', type: '' });

  useEffect(() => {
    Promise.all([getStudents(), getFaculty(), getBooks()])
      .then(([s, f, b]) => {
        // Tag each user with their type so the dropdown is informative
        const students = s.data.map(u => ({ ...u, _type: 'STU' }));
        const faculty  = f.data.map(u => ({ ...u, _type: 'FAC' }));
        setUsers([...students, ...faculty]);
        setBooks(b.data);
      });
  }, []);

  const loadTransactions = (uid) => {
    if (!uid) return;
    getUserBorrows(uid).then(res => setTransactions(res.data)).catch(() => setTransactions([]));
  };

  const handleBorrow = () => {
    if (!userId || !bookId) { setMsg({ text: 'Please select both a user and a book.', type: 'error' }); return; }
    setMsg({ text: '', type: '' });
    borrowBook(parseInt(userId), parseInt(bookId))
      .then(() => {
        setMsg({ text: '✅ Book issued successfully!', type: 'success' });
        setBookId('');
        loadTransactions(userId);
      })
      .catch(err => setMsg({ text: err.response?.data || 'Error issuing book.', type: 'error' }));
  };

  const handleReturn = (txId) => {
    returnBook(txId)
      .then((res) => {
        const fine = res.data?.fine;
        const fineMsg = fine ? ` Fine generated: €${fine.totalAmount.toFixed(2)} (${fine.overdueDays} days overdue).` : '';
        setMsg({ text: `✅ Book returned successfully.${fineMsg}`, type: fine ? 'error' : 'success' });
        loadTransactions(userId);
      })
      .catch(err => setMsg({ text: err.response?.data || 'Return failed.', type: 'error' }));
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div>
      <h1 className="page-title">📤 Borrow / Return Books</h1>

      {msg.text && (
        <div className={`alert ${msg.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          {msg.text}
        </div>
      )}

      {/* Issue a Book */}
      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>Issue a Book</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Select User</label>
            <select value={userId}
              onChange={e => { setUserId(e.target.value); loadTransactions(e.target.value); }}>
              <option value="">-- Choose User --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  [{u._type}] {u.name} — {u.email}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Select Book</label>
            <select value={bookId} onChange={e => setBookId(e.target.value)}>
              <option value="">-- Choose Book --</option>
              {books.map(b => (
                <option key={b.id} value={b.id}>
                  {b.title} — {b.author}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleBorrow}>
          📤 Issue Book
        </button>
      </div>

      {/* Borrow History */}
      {userId && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
            <strong>Borrow History</strong>
            <span style={{ color: '#718096', marginLeft: '8px', fontSize: '0.9rem' }}>
              ({transactions.filter(t => !t.returned).length} active)
            </span>
          </div>
          <table>
            <thead>
              <tr>
                <th>TX ID</th>
                <th>Book</th>
                <th>Copy Code</th>
                <th>Borrowed</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td><strong>{t.bookCopy?.book?.title || '—'}</strong></td>
                  <td><code style={{ fontSize: '0.82rem' }}>{t.bookCopy?.copyCode}</code></td>
                  <td>{t.borrowDate}</td>
                  <td style={{ color: !t.returned && isOverdue(t.dueDate) ? '#e53e3e' : 'inherit' }}>
                    {t.dueDate}
                    {!t.returned && isOverdue(t.dueDate) && ' ⚠️'}
                  </td>
                  <td>
                    {t.returned
                      ? <span className="badge badge-green">Returned {t.returnDate}</span>
                      : isOverdue(t.dueDate)
                        ? <span className="badge badge-red">Overdue</span>
                        : <span className="badge badge-yellow">Active</span>
                    }
                  </td>
                  <td>
                    {!t.returned && (
                      <button className="btn btn-success btn-sm" onClick={() => handleReturn(t.id)}>
                        ↩ Return
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#718096', padding: '24px' }}>
                    No borrow history for this user.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default BorrowBook;
