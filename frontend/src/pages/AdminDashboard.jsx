// src/pages/AdminDashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { getBooks, getStudents, getFaculty, getOverdue, getAllPendingPreborrows, adminApprovePreborrow } from '../services/api';

function AdminDashboard() {
  const [stats,        setStats]        = useState({ books: 0, students: 0, faculty: 0, overdue: 0 });
  const [overdueList,  setOverdueList]  = useState([]);
  const [reservations, setReservations] = useState([]);   // all PENDING pre-borrows
  const [approving,    setApproving]    = useState(null); // id being approved
  const [approveMsg,   setApproveMsg]   = useState(null); // { type:'ok'|'err', text }
  const [loading,      setLoading]      = useState(true);

  const loadDashboard = useCallback(() => {
    setLoading(true);
    Promise.all([getBooks(), getStudents(), getFaculty(), getOverdue(), getAllPendingPreborrows()])
      .then(([b, s, f, o, r]) => {
        setStats({
          books:    b.data.length,
          students: s.data.length,
          faculty:  f.data.length,
          overdue:  o.data.length,
        });
        setOverdueList(o.data.slice(0, 8));
        setReservations(r.data);
      })
      .catch(err => console.error('Dashboard load error:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  // Group pending reservations by book title
  const reservationsByBook = reservations.reduce((acc, pb) => {
    const bookTitle = pb.book?.title || `Book #${pb.book?.id}`;
    if (!acc[bookTitle]) acc[bookTitle] = [];
    
    acc[bookTitle].push(pb);
    return acc;
  }, {});

  const hasCopyAvailable = (group) => group.some(pb => pb.assignedCopy != null);

  const handleApprove = async (preBorrowId, userName, bookTitle) => {
    setApproving(preBorrowId);
    setApproveMsg(null);
    try {
      await adminApprovePreborrow(preBorrowId);
      setApproveMsg({ type: 'ok', text: `✅ Approved! "${bookTitle}" has been issued to ${userName}.` });
      loadDashboard(); // refresh list
    } catch (err) {
      const msg = err.response?.data || err.message || 'Approval failed.';
      setApproveMsg({ type: 'err', text: `❌ ${msg}` });
    } finally {
      setApproving(null);
    }
  };

  if (loading) return <p style={{ color: '#718096' }}>Loading dashboard...</p>;

  const pendingBookCount = Object.keys(reservationsByBook).length;
  const copyAvailableCount = Object.values(reservationsByBook).filter(hasCopyAvailable).length;

  return (
    <div>
      <h1 className="page-title">🔑 Admin Dashboard</h1>

      {/* Row 1 — General stats */}
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

      {/* ── Reservations Awaiting Admin Approval ─────────────────── */}
      <div className="card" style={{ marginTop: '20px', padding: 0 }}>
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <span style={{
            background: reservations.length > 0 ? '#fefcbf' : '#f0fff4',
            color: reservations.length > 0 ? '#744210' : '#276749',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 600
          }}>
            📋 {reservations.length} Pending Reservation{reservations.length !== 1 ? 's' : ''}
          </span>
          {copyAvailableCount > 0 && (
            <span style={{
              background: '#c6f6d5',
              color: '#22543d',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 600
            }}>
              🟢 {copyAvailableCount} book{copyAvailableCount !== 1 ? 's' : ''} ready — awaiting your approval
            </span>
          )}
          <strong style={{ color: '#2c5282' }}>Reservation Queue — Approve to Issue</strong>
        </div>

        {approveMsg && (
          <div style={{
            margin: '12px 20px 0',
            padding: '10px 16px',
            borderRadius: '8px',
            background: approveMsg.type === 'ok' ? '#f0fff4' : '#fff5f5',
            color:      approveMsg.type === 'ok' ? '#22543d' : '#c53030',
            fontWeight: 500,
            fontSize: '0.9rem'
          }}>
            {approveMsg.text}
          </div>
        )}

        {reservations.length === 0 ? (
          <p style={{ padding: '20px', color: '#718096', margin: 0 }}>
            No pending reservations at this time.
          </p>
        ) : (
          <div style={{ padding: '16px 20px' }}>
            {Object.entries(reservationsByBook).map(([bookTitle, group]) => {
              const copyReady = hasCopyAvailable(group);
              const copyCode  = group.find(pb => pb.assignedCopy)?.assignedCopy?.copyCode;

              return (
                <div key={bookTitle} style={{
                  marginBottom: '20px',
                  border: `2px solid ${copyReady ? '#68d391' : '#e2e8f0'}`,
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}>
                  {/* Book header */}
                  <div style={{
                    padding: '10px 16px',
                    background: copyReady ? '#f0fff4' : '#f7fafc',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    flexWrap: 'wrap'
                  }}>
                    <strong style={{ color: '#2d3748', fontSize: '0.97rem' }}>📖 {bookTitle}</strong>
                    {copyReady ? (
                      <span style={{
                        background: '#c6f6d5', color: '#22543d',
                        padding: '2px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600
                      }}>
                        ✅ Copy Available {copyCode ? `(${copyCode})` : ''} — Choose who gets it
                      </span>
                    ) : (
                      <span style={{
                        background: '#fed7d7', color: '#c53030',
                        padding: '2px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600
                      }}>
                        ⏳ No copy available yet — all copies still borrowed
                      </span>
                    )}
                    <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: '#718096' }}>
                      {group.length} user{group.length !== 1 ? 's' : ''} in queue
                    </span>
                  </div>

                  {/* Queue table */}
                  <table style={{ margin: 0, width: '100%' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '32px' }}>#</th>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Email</th>
                        <th>Reserved On</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group
                        .slice()
                        .sort((a, b) => a.queuePosition - b.queuePosition)
                        .map((pb) => {
                          const role     = pb.user?.role || '';
                          const isFaculty = role.toUpperCase() === 'FACULTY';
                          const isStudent = role.toUpperCase() === 'STUDENT';
                          return (
                            <tr key={pb.id} style={{ background: approving === pb.id ? '#fffde7' : undefined }}>
                              <td style={{ textAlign: 'center', fontWeight: 700, color: '#4a5568' }}>
                                {pb.queuePosition}
                              </td>
                              <td>
                                <strong>{pb.user?.name}</strong>
                              </td>
                              <td>
                                {isFaculty ? (
                                  <span style={{
                                    background: '#ebf8ff', color: '#2b6cb0',
                                    padding: '2px 8px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 600
                                  }}>👨‍🏫 Faculty</span>
                                ) : isStudent ? (
                                  <span style={{
                                    background: '#faf5ff', color: '#553c9a',
                                    padding: '2px 8px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 600
                                  }}>🎓 Student</span>
                                ) : (
                                  <span style={{ fontSize: '0.82rem', color: '#718096' }}>{role}</span>
                                )}
                              </td>
                              <td style={{ fontSize: '0.85rem', color: '#4a5568' }}>{pb.user?.email}</td>
                              <td style={{ fontSize: '0.85rem', color: '#4a5568' }}>{pb.requestDate}</td>
                              <td>
                                {copyReady ? (
                                  <button
                                    onClick={() => handleApprove(pb.id, pb.user?.name, bookTitle)}
                                    disabled={approving === pb.id}
                                    style={{
                                      background: approving === pb.id ? '#a0aec0' : '#38a169',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '5px 14px',
                                      fontWeight: 600,
                                      cursor: approving === pb.id ? 'not-allowed' : 'pointer',
                                      fontSize: '0.82rem'
                                    }}
                                  >
                                    {approving === pb.id ? 'Approving…' : '✅ Approve'}
                                  </button>
                                ) : (
                                  <span style={{ fontSize: '0.8rem', color: '#a0aec0' }}>Waiting for copy</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>

                  {copyReady && (
                    <div style={{
                      padding: '8px 16px',
                      background: '#fffde7',
                      fontSize: '0.8rem',
                      color: '#744210',
                      borderTop: '1px solid #fefcbf'
                    }}>
                      ℹ️ The copy is locked (RESERVED) — no one can borrow it until you approve a reservation above.
                      Approving issues the book immediately to the selected user.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
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

        {/* Quick Actions */}
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
        <div className="card" style={{ padding: 0, marginTop: '20px' }}>
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
