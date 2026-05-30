// src/pages/Books.jsx
import React, { useEffect, useState } from 'react';
import {
  getBooks, addBook, updateBook, deleteBook, searchBooks,
  getBookCopies, addBookCopy, deleteBookCopy
} from '../services/api';

function Books() {
  const [books,      setBooks]      = useState([]);
  const [bookCopies, setBookCopies] = useState({}); // { bookId: [copies] }
  const [search,     setSearch]     = useState('');
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');

  // Add/Edit modal
  const [showForm, setShowForm] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const emptyForm = { title: '', author: '', isbn: '', genre: '', publisher: '', publishedYear: '', description: '', restrictedFromRemoval: false, inLibraryHoursLimit: 0 };
  const [form, setForm] = useState(emptyForm);

  // Copies modal
  const [copiesBook, setCopiesBook] = useState(null);
  const [copies,     setCopies]     = useState([]);
  const [showCopies, setShowCopies] = useState(false);

  useEffect(() => { loadBooks(); }, []);

  const loadBooks = () => {
    setError('');
    getBooks().then(res => {
      const bookList = res.data;
      setBooks(bookList);
      // Load copies for all books to show stats in table
      Promise.all(
        bookList.map(b => getBookCopies(b.id).then(r => ({ id: b.id, copies: r.data })).catch(() => ({ id: b.id, copies: [] })))
      ).then(results => {
        const map = {};
        results.forEach(({ id, copies }) => { map[id] = copies; });
        setBookCopies(map);
      });
    }).catch(() => setError('Failed to load books.'));
  };

  const handleSearch = () => {
    if (!search.trim()) { loadBooks(); return; }
    searchBooks({ title: search }).then(res => setBooks(res.data)).catch(() => setError('Search failed.'));
  };

  // ── Add / Edit ──────────────────────────────────────────────────
  const openAdd  = () => { setEditBook(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (book) => { setEditBook(book); setForm({ ...book }); setShowForm(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const action = editBook ? updateBook(editBook.id, form) : addBook(form);
    action
      .then(() => {
        setShowForm(false);
        loadBooks();
        setSuccess(editBook ? '✅ Book updated.' : '✅ Book added. Click 📋 Copies to add physical copies.');
        setTimeout(() => setSuccess(''), 6000);
      })
      .catch(err => setError(err.response?.data || 'Save failed.'));
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this book and ALL its copies?')) return;
    setError('');
    deleteBook(id)
      .then(() => { loadBooks(); setSuccess('✅ Book deleted.'); setTimeout(() => setSuccess(''), 3000); })
      .catch(err => setError(err.response?.data || 'Delete failed.'));
  };

  // ── Copies modal ────────────────────────────────────────────────
  const openCopies = (book) => {
    setCopiesBook(book);
    setShowCopies(true);
    getBookCopies(book.id).then(res => setCopies(res.data)).catch(() => setCopies([]));
  };

  const handleAddCopy = () => {
    addBookCopy(copiesBook.id, {})
      .then(res => {
        setCopies(prev => [...prev, res.data]);
        // Refresh copy stats in table
        setBookCopies(prev => ({
          ...prev,
          [copiesBook.id]: [...(prev[copiesBook.id] || []), res.data]
        }));
        setSuccess(`✅ Copy "${res.data.copyCode}" added — status: AVAILABLE`);
        setTimeout(() => setSuccess(''), 3000);
      })
      .catch(err => setError(err.response?.data || 'Failed to add copy.'));
  };

  const handleDeleteCopy = (copyId, copyCode) => {
    if (!window.confirm(`Delete copy "${copyCode}"? This cannot be undone.`)) return;
    deleteBookCopy(copyId)
      .then(() => {
        const updated = copies.filter(c => c.id !== copyId);
        setCopies(updated);
        // Refresh copy stats in table
        setBookCopies(prev => ({
          ...prev,
          [copiesBook.id]: updated
        }));
        setSuccess(`✅ Copy "${copyCode}" deleted.`);
        setTimeout(() => setSuccess(''), 3000);
      })
      .catch(err => setError(err.response?.data || 'Failed to delete copy. It may be currently borrowed.'));
  };

  // ── Helpers ─────────────────────────────────────────────────────
  const statusBadge = (s) => {
    const map = { AVAILABLE: 'badge-green', BORROWED: 'badge-yellow', RESERVED: 'badge-blue', LOST: 'badge-red', DAMAGED: 'badge-red' };
    return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
  };

  const getCopyStats = (bookId) => {
    const c = bookCopies[bookId] || [];
    return {
      available: c.filter(x => x.status === 'AVAILABLE').length,
      borrowed:  c.filter(x => x.status === 'BORROWED').length,
      total:     c.length,
    };
  };

  const f = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  // Count stats across all copies shown in modal
  const modalStats = {
    available: copies.filter(c => c.status === 'AVAILABLE').length,
    borrowed:  copies.filter(c => c.status === 'BORROWED').length,
    total:     copies.length,
  };

  return (
    <div>
      <h1 className="page-title">📖 Books</h1>

      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Search + Add */}
      <div className="search-bar">
        <input placeholder="Search by title..." value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()} />
        <button className="btn btn-primary" onClick={handleSearch}>Search</button>
        <button className="btn btn-success" onClick={openAdd}>+ Add Book</button>
      </div>

      {/* Tip */}
      <div style={{ background: '#ebf8ff', border: '1px solid #bee3f8', borderRadius: '8px',
                    padding: '12px 16px', marginBottom: '16px', color: '#2c5282', fontSize: '0.9rem' }}>
        💡 <strong>Tip:</strong> After adding a book, click <strong>📋 Copies</strong> to add physical copies.
        A book cannot be borrowed until at least one copy exists with status <em>AVAILABLE</em>.
      </div>

      {/* Books Table */}
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Author</th>
              <th>Genre</th>
              <th>Year</th>
              <th>Type</th>
              <th style={{ textAlign: 'center', color: '#276749' }}>✅ Available</th>
              <th style={{ textAlign: 'center', color: '#92400e' }}>📤 Borrowed</th>
              <th style={{ textAlign: 'center', color: '#2c5282' }}>📚 Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map(b => {
              const stats = getCopyStats(b.id);
              return (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td><strong>{b.title}</strong></td>
                  <td>{b.author}</td>
                  <td>{b.genre || '—'}</td>
                  <td>{b.publishedYear || '—'}</td>
                  <td>
                    {b.restrictedFromRemoval
                      ? <span className="badge badge-red">In-Library Only</span>
                      : <span className="badge badge-green">Can Borrow</span>}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#276749', fontSize: '1rem' }}>{stats.available}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#92400e', fontSize: '1rem' }}>{stats.borrowed}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#2c5282', fontSize: '1rem' }}>{stats.total}</span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => openEdit(b)}>Edit</button>
                    {' '}
                    <button className="btn btn-sm" style={{ background: '#805ad5', color: 'white' }}
                      onClick={() => openCopies(b)} title="View / manage physical copies">
                      📋 Copies
                    </button>
                    {' '}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.id)}>Delete</button>
                  </td>
                </tr>
              );
            })}
            {books.length === 0 && (
              <tr><td colSpan={10} style={{ textAlign: 'center', color: '#718096', padding: '24px' }}>
                No books found.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Add/Edit Book Modal ── */}
      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editBook ? '✏️ Edit Book' : '➕ Add New Book'}</div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Title *</label>
                  <input required value={form.title} onChange={f('title')} />
                </div>
                <div className="form-group">
                  <label>Author *</label>
                  <input required value={form.author} onChange={f('author')} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>ISBN</label>
                  <input value={form.isbn || ''} onChange={f('isbn')} />
                </div>
                <div className="form-group">
                  <label>Genre</label>
                  <input value={form.genre || ''} onChange={f('genre')} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Publisher</label>
                  <input value={form.publisher || ''} onChange={f('publisher')} />
                </div>
                <div className="form-group">
                  <label>Published Year</label>
                  <input type="number" value={form.publishedYear || ''} onChange={f('publishedYear')} />
                </div>
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" checked={form.restrictedFromRemoval}
                    onChange={e => setForm({ ...form, restrictedFromRemoval: e.target.checked })} />
                  {' '}In-Library Only (cannot be taken home)
                </label>
              </div>
              {form.restrictedFromRemoval && (
                <div className="form-group">
                  <label>Max In-Library Hours</label>
                  <input type="number" value={form.inLibraryHoursLimit || 4}
                    onChange={e => setForm({ ...form, inLibraryHoursLimit: parseInt(e.target.value) })} />
                </div>
              )}
              <div className="modal-footer">
                <button type="button" className="btn" style={{ background: '#e2e8f0' }} onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editBook ? 'Save Changes' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Copies Modal ── */}
      {showCopies && copiesBook && (
        <div className="modal-backdrop" onClick={() => setShowCopies(false)}>
          <div className="modal" style={{ width: '650px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-title">📋 Copies of "{copiesBook.title}"</div>

            {/* Stats Summary */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: '8px',
                            padding: '10px 18px', textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#276749' }}>{modalStats.available}</div>
                <div style={{ fontSize: '0.8rem', color: '#276749' }}>✅ Available</div>
              </div>
              <div style={{ background: '#fffbeb', border: '1px solid #f6e05e', borderRadius: '8px',
                            padding: '10px 18px', textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#92400e' }}>{modalStats.borrowed}</div>
                <div style={{ fontSize: '0.8rem', color: '#92400e' }}>📤 Borrowed</div>
              </div>
              <div style={{ background: '#ebf8ff', border: '1px solid #90cdf4', borderRadius: '8px',
                            padding: '10px 18px', textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#2c5282' }}>{modalStats.total}</div>
                <div style={{ fontSize: '0.8rem', color: '#2c5282' }}>📚 Total Copies</div>
              </div>
            </div>

            {/* Copies table */}
            {copies.length > 0 ? (
              <table style={{ marginBottom: '16px' }}>
                <thead>
                  <tr>
                    <th>Copy ID</th>
                    <th>Copy Code</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {copies.map(c => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td><code>{c.copyCode}</code></td>
                      <td>{statusBadge(c.status)}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteCopy(c.id, c.copyCode)}
                          disabled={c.status === 'BORROWED'}
                          title={c.status === 'BORROWED' ? 'Cannot delete — currently borrowed' : 'Delete this copy'}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '8px',
                            padding: '14px', marginBottom: '16px', color: '#742a2a' }}>
                ⚠️ No copies yet — this book <strong>cannot be borrowed</strong> until you add at least one copy.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button className="btn btn-success" onClick={handleAddCopy}>
                + Add New Copy
              </button>
              <button className="btn" style={{ background: '#e2e8f0' }} onClick={() => setShowCopies(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Books;
