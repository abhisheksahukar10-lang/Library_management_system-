// src/pages/StudentDashboard.jsx  — v4: Borrow + Pre-borrow + History + Fines
import React, { useEffect, useState } from 'react';
import {
  getUserBorrows, getUnpaidFines, getAllUserFines, payFine,
  getBooks, searchBooks, getBookCopies,
  borrowBook, placePreborrow, cancelPreborrow, fulfilPreborrow,
  getUserPreborrows
} from '../services/api';

function StudentDashboard({ user }) {
  const [borrows,     setBorrows]     = useState([]);
  const [allFines,    setAllFines]    = useState([]);
  const [unpaidFines, setUnpaidFines] = useState([]);
  const [books,       setBooks]       = useState([]);
  const [preborrows,  setPreborrows]  = useState([]);
  const [search,      setSearch]      = useState('');
  const [msg,         setMsg]         = useState({ text: '', type: '' });
  const [tab,         setTab]         = useState('borrows');
  const [loadingBook, setLoadingBook] = useState(null); // bookId being acted on

  useEffect(() => { loadAll(); }, [user.id]);

  const loadAll = () => {
    getUserBorrows(user.id).then(r => setBorrows(r.data)).catch(() => {});
    getUnpaidFines(user.id).then(r => setUnpaidFines(r.data)).catch(() => {});
    getAllUserFines(user.id).then(r => setAllFines(r.data)).catch(() => {});
    getBooks().then(r => setBooks(r.data)).catch(() => {});
    getUserPreborrows(user.id).then(r => setPreborrows(r.data)).catch(() => {});
  };

  const flash = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  const handleSearch = () => {
    if (!search.trim()) { getBooks().then(r => setBooks(r.data)); return; }
    searchBooks({ title: search }).then(r => setBooks(r.data)).catch(() => {});
  };

  const handleBorrow = async (bookId) => {
    setLoadingBook(bookId);
    try {
      // Check if copies available
      const copiesRes = await getBookCopies(bookId);
      const available = copiesRes.data.filter(c => c.status === 'AVAILABLE');
      if (available.length === 0) {
        flash('⚠️ No copies available. Use "Reserve" to join the waiting list.', 'error');
        setLoadingBook(null);
        return;
      }
      await borrowBook(user.id, bookId);
      flash('✅ Book borrowed successfully!');
      loadAll();
    } catch (err) {
      flash(err.response?.data || 'Borrow failed.', 'error');
    }
    setLoadingBook(null);
  };

  const handleReserve = async (bookId) => {
    setLoadingBook(bookId + '_r');
    try {
      await placePreborrow(user.id, bookId);
      flash('📋 Reservation placed! You will be notified when the book is ready.');
      loadAll();
    } catch (err) {
      flash(err.response?.data || 'Reservation failed.', 'error');
    }
    setLoadingBook(null);
  };

  const handleCancelReserve = async (pbId) => {
    try {
      await cancelPreborrow(pbId, user.id);
      flash('🗑️ Reservation cancelled.');
      loadAll();
    } catch (err) {
      flash(err.response?.data || 'Cancel failed.', 'error');
    }
  };

  const handleFulfil = async (pbId) => {
    try {
      await fulfilPreborrow(pbId, user.id);
      flash('✅ Reservation fulfilled — book is now borrowed!');
      loadAll();
    } catch (err) {
      flash(err.response?.data || 'Could not fulfil reservation.', 'error');
    }
  };

  const handlePay = (fineId) => {
    payFine(fineId)
      .then(() => { flash('✅ Fine paid successfully!'); loadAll(); })
      .catch(err => flash(err.response?.data || 'Payment failed.', 'error'));
  };

  const isOverdue = (d) => d && new Date(d) < new Date();
  const activeBorrows   = borrows.filter(b => !b.returned);
  const historyBorrows  = borrows.filter(b => b.returned);
  const totalUnpaid     = unpaidFines.reduce((s, f) => s + f.totalAmount, 0);
  const totalAllFines   = allFines.reduce((s, f) => s + f.totalAmount, 0);
  const pendingReserves = preborrows.filter(p => p.status === 'PENDING' || p.status === 'READY');

  const statusBadge = (status) => {
    const map = {
      PENDING:   ['badge-yellow', '⏳ Waiting'],
      READY:     ['badge-green',  '✅ Ready to Pick Up'],
      FULFILLED: ['badge-blue',   '📚 Fulfilled'],
      CANCELLED: ['badge-red',    '❌ Cancelled'],
    };
    const [cls, label] = map[status] || ['', status];
    return <span className={`badge ${cls}`}>{label}</span>;
  };

  const tabs = [
    ['borrows',   `📤 Active (${activeBorrows.length})`],
    ['reserves',  `📋 Reservations (${pendingReserves.length})`],
    ['history',   `📜 History (${historyBorrows.length})`],
    ['fines',     `💶 Fines (${unpaidFines.length} unpaid)`],
    ['books',     '📖 Browse & Borrow'],
  ];

  return (
    <div>
      <h1 className="page-title">🎓 Student Dashboard</h1>

      {/* Welcome card */}
      <div className="card" style={{ background: 'linear-gradient(135deg,#ebf8ff 0%,#bee3f8 100%)', border: '1px solid #90cdf4', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ color: '#1a365d', marginBottom: '4px' }}>Welcome, {user.name}! 👋</h2>
            <p style={{ color: '#4a5568', margin: 0 }}>{user.email}</p>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            {[
              [activeBorrows.length + '/3', 'Active Borrows', '#2c5282'],
              [pendingReserves.length,       'Reservations',   '#744210'],
              ['€' + totalUnpaid.toFixed(2), 'Fines Due',      unpaidFines.length ? '#c53030' : '#38a169'],
            ].map(([val, label, color]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color }}>{val}</div>
                <div style={{ fontSize: '0.82rem', color: '#4a5568' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: '14px', background: 'white', borderRadius: '8px', padding: '10px 14px',
                      display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.88rem' }}>
          <span>📚 Max: <strong>3 books</strong></span>
          <span>📅 Duration: <strong>14 days</strong></span>
          <span>💶 Fine: <strong>€1.00/day</strong></span>
          <span style={{ color: '#c53030' }}>⚠️ Unpaid fines block borrowing</span>
        </div>
      </div>

      {msg.text && (
        <div className={`alert ${msg.type === 'error' ? 'alert-error' : 'alert-success'}`}
             style={{ marginBottom: '16px' }}>
          {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {tabs.map(([key, label]) => (
          <button key={key} className={`btn ${tab === key ? 'btn-primary' : ''}`}
            style={tab !== key ? { background: '#e2e8f0', color: '#2d3748' } : {}}
            onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      {/* ── ACTIVE BORROWS ── */}
      {tab === 'borrows' && (
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr><th>Book</th><th>Copy Code</th><th>Borrowed On</th><th>Due Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {activeBorrows.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#718096', padding: '28px' }}>
                  No active borrows. Go to <strong>Browse &amp; Borrow</strong> to get started!
                </td></tr>
              )}
              {activeBorrows.map(t => (
                <tr key={t.id}>
                  <td><strong>{t.bookCopy?.book?.title || '—'}</strong><br/>
                    <span style={{ fontSize: '0.8rem', color: '#718096' }}>{t.bookCopy?.book?.author}</span>
                  </td>
                  <td><code style={{ fontSize: '0.82rem' }}>{t.bookCopy?.copyCode}</code></td>
                  <td>{t.borrowDate}</td>
                  <td style={{ color: isOverdue(t.dueDate) ? '#e53e3e' : 'inherit', fontWeight: isOverdue(t.dueDate) ? 700 : 400 }}>
                    {t.dueDate}{isOverdue(t.dueDate) && ' ⚠️'}
                  </td>
                  <td>
                    {isOverdue(t.dueDate)
                      ? <span className="badge badge-red">Overdue</span>
                      : <span className="badge badge-yellow">Active</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── RESERVATIONS ── */}
      {tab === 'reserves' && (
        <>
          {preborrows.filter(p => p.status === 'READY').length > 0 && (
            <div className="alert alert-success" style={{ marginBottom: '12px' }}>
              🎉 A reserved book is ready for pickup! Click <strong>Fulfil</strong> to borrow it now.
            </div>
          )}
          <div className="card" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr><th>Book</th><th>Author</th><th>Requested On</th><th>Queue #</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {preborrows.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: '#718096', padding: '28px' }}>
                    No reservations. If a book is unavailable, you can reserve it from <strong>Browse &amp; Borrow</strong>.
                  </td></tr>
                )}
                {preborrows.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.book?.title || '—'}</strong></td>
                    <td>{p.book?.author || '—'}</td>
                    <td>{p.requestDate}</td>
                    <td style={{ textAlign: 'center' }}>
                      {p.status === 'PENDING' ? <strong>#{p.queuePosition}</strong> : '—'}
                    </td>
                    <td>{statusBadge(p.status)}</td>
                    <td>
                      {p.status === 'READY' && (
                        <button className="btn btn-success btn-sm"
                          onClick={() => handleFulfil(p.id)}>
                          Fulfil →
                        </button>
                      )}
                      {p.status === 'PENDING' && (
                        <button className="btn btn-danger btn-sm"
                          onClick={() => handleCancelReserve(p.id)}>
                          Cancel
                        </button>
                      )}
                      {(p.status === 'FULFILLED' || p.status === 'CANCELLED') && (
                        <span style={{ color: '#a0aec0', fontSize: '0.85rem' }}>{p.status === 'FULFILLED' ? 'Done' : 'Cancelled'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── HISTORY ── */}
      {tab === 'history' && (
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr><th>Book</th><th>Copy</th><th>Borrowed</th><th>Returned</th><th>Fine Incurred</th></tr>
            </thead>
            <tbody>
              {historyBorrows.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#718096', padding: '28px' }}>
                  No returned books yet.
                </td></tr>
              )}
              {historyBorrows.map(t => (
                <tr key={t.id}>
                  <td>
                    <strong>{t.bookCopy?.book?.title || '—'}</strong><br/>
                    <span style={{ fontSize: '0.8rem', color: '#718096' }}>{t.bookCopy?.book?.author}</span>
                  </td>
                  <td><code style={{ fontSize: '0.82rem' }}>{t.bookCopy?.copyCode}</code></td>
                  <td>{t.borrowDate}</td>
                  <td>{t.returnDate || '—'}</td>
                  <td>
                    {t.fine
                      ? <span style={{ color: t.fine.paid ? '#38a169' : '#c53030', fontWeight: 600 }}>
                          €{t.fine.totalAmount?.toFixed(2)} {t.fine.paid ? '✅ Paid' : '❌ Unpaid'}
                        </span>
                      : <span style={{ color: '#38a169' }}>No fine</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {historyBorrows.length > 0 && (
            <div style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0',
                          display: 'flex', gap: '24px', fontSize: '0.88rem', color: '#4a5568' }}>
              <span>Total books returned: <strong>{historyBorrows.length}</strong></span>
              <span>Total fines ever: <strong style={{ color: totalAllFines > 0 ? '#c53030' : '#38a169' }}>
                €{totalAllFines.toFixed(2)}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* ── FINES ── */}
      {tab === 'fines' && (
        <>
          {unpaidFines.length > 0 && (
            <div className="alert alert-error" style={{ marginBottom: '12px' }}>
              ⚠️ You have <strong>{unpaidFines.length}</strong> unpaid fine(s) — total:
              <strong> €{totalUnpaid.toFixed(2)}</strong>. Pay to unlock borrowing.
            </div>
          )}
          <div className="card" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr><th>Book</th><th>Overdue Days</th><th>Rate/Day</th><th>Total (€)</th><th>Date</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {allFines.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: '#718096', padding: '28px' }}>
                    🎉 No fines on record!
                  </td></tr>
                )}
                {allFines.map(f => (
                  <tr key={f.id}>
                    <td><strong>{f.transaction?.bookCopy?.book?.title || '—'}</strong></td>
                    <td>{f.overdueDays} days</td>
                    <td>€{f.fineAmountPerDay?.toFixed(2)}</td>
                    <td><strong>€{f.totalAmount?.toFixed(2)}</strong></td>
                    <td>{f.fineDate}</td>
                    <td>
                      {f.paid
                        ? <span className="badge badge-green">✅ Paid</span>
                        : <span className="badge badge-red">❌ Unpaid</span>}
                    </td>
                    <td>
                      {!f.paid && (
                        <button className="btn btn-success btn-sm" onClick={() => handlePay(f.id)}>
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── BROWSE & BORROW ── */}
      {tab === 'books' && (
        <>
          <div className="search-bar">
            <input placeholder="Search by title..." value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            <button className="btn btn-primary" onClick={handleSearch}>Search</button>
            <button className="btn" style={{ background: '#e2e8f0' }}
              onClick={() => { setSearch(''); getBooks().then(r => setBooks(r.data)); }}>
              Reset
            </button>
          </div>
          <div className="card" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr><th>Title</th><th>Author</th><th>Genre</th><th>Year</th><th>Type</th><th>Action</th></tr>
              </thead>
              <tbody>
                {books.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: '#718096', padding: '28px' }}>
                    No books found.
                  </td></tr>
                )}
                {books.map(b => {
                  const alreadyReserved = preborrows.some(
                    p => p.book?.id === b.id && (p.status === 'PENDING' || p.status === 'READY'));
                  const isLoading = loadingBook === b.id || loadingBook === b.id + '_r';
                  return (
                    <tr key={b.id}>
                      <td>
                        <strong>{b.title}</strong><br/>
                        <span style={{ fontSize: '0.8rem', color: '#718096' }}>{b.isbn}</span>
                      </td>
                      <td>{b.author}</td>
                      <td>{b.genre || '—'}</td>
                      <td>{b.publishedYear || '—'}</td>
                      <td>
                        {b.restrictedFromRemoval
                          ? <span className="badge badge-red">In-Library</span>
                          : <span className="badge badge-green">Borrowable</span>}
                      </td>
                      <td>
                        {b.restrictedFromRemoval ? (
                          <span style={{ color: '#a0aec0', fontSize: '0.85rem' }}>In-library only</span>
                        ) : alreadyReserved ? (
                          <span className="badge badge-yellow">Reserved ✓</span>
                        ) : (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn btn-primary btn-sm"
                              disabled={isLoading}
                              onClick={() => handleBorrow(b.id)}>
                              {loadingBook === b.id ? '...' : 'Borrow'}
                            </button>
                            <button className="btn btn-sm"
                              style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #f6ad55' }}
                              disabled={isLoading}
                              onClick={() => handleReserve(b.id)}>
                              {loadingBook === b.id + '_r' ? '...' : 'Reserve'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p style={{ color: '#718096', fontSize: '0.82rem', marginTop: '10px' }}>
            💡 <strong>Borrow</strong> picks up an available copy instantly.
            <strong> Reserve</strong> joins the waiting list if no copies are free —
            you'll be notified when one is ready.
          </p>
        </>
      )}
    </div>
  );
}

export default StudentDashboard;
