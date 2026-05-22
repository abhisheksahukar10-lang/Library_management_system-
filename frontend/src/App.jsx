// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

import Login              from './pages/Login';
import AdminDashboard     from './pages/AdminDashboard';
import StudentDashboard   from './pages/StudentDashboard';
import ProfessorDashboard from './pages/ProfessorDashboard';
import Books              from './pages/Books';
import Users              from './pages/Users';
import BorrowBook         from './pages/BorrowBook';
import Fines              from './pages/Fines';
import ChatbotPage        from './pages/ChatbotPage';
import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('libraryUser');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData) => {
    localStorage.setItem('libraryUser', JSON.stringify(userData));
    setUser(userData);
    console.log('%c✅ Logged in: ' + userData.name + ' [' + userData.role + ']', 'color:#38a169;font-weight:bold');
  };

  const handleLogout = () => {
    localStorage.removeItem('libraryUser');
    setUser(null);
  };

  if (!user) return <Login onLogin={handleLogin} />;

  const isAdmin   = user.role === 'ADMIN';
  const isStudent = user.role === 'STUDENT';
  const isFaculty = user.role === 'FACULTY';
  const roleIcon  = isAdmin ? '🔑' : isStudent ? '🎓' : '👨‍🏫';
  const roleColor = isAdmin ? '#fef3c7' : isStudent ? '#ebf8ff' : '#faf5ff';

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">📚 UniLibrary</div>
          <div className="nav-links">
            {isAdmin && <>
              <Link to="/">Dashboard</Link>
              <Link to="/books">Books</Link>
              <Link to="/users">Users</Link>
              <Link to="/borrow">Borrow / Return</Link>
              <Link to="/fines">Fines</Link>
              <Link to="/chatbot">🤖 Chatbot</Link>
            </>}
            {(isStudent || isFaculty) && <>
              <Link to="/">My Dashboard</Link>
              <Link to="/chatbot">🤖 Chatbot</Link>
            </>}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <span style={{ background: roleColor, color:'#2d3748', padding:'4px 12px',
                           borderRadius:'20px', fontSize:'0.85rem', fontWeight:600 }}>
              {roleIcon} {user.name}
            </span>
            <button onClick={handleLogout}
              style={{ background:'transparent', border:'1px solid #4a5568', color:'#bee3f8',
                       padding:'4px 12px', borderRadius:'6px', cursor:'pointer', fontSize:'0.85rem' }}>
              Logout
            </button>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={
              isAdmin   ? <AdminDashboard /> :
              isStudent ? <StudentDashboard user={user} /> :
                          <ProfessorDashboard user={user} />
            } />
            {isAdmin && <>
              <Route path="/books"  element={<Books />} />
              <Route path="/users"  element={<Users />} />
              <Route path="/borrow" element={<BorrowBook />} />
              <Route path="/fines"  element={<Fines />} />
            </>}
            <Route path="/chatbot" element={<ChatbotPage user={user} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
