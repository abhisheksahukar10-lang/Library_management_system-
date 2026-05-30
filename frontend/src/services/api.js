<<<<<<< HEAD
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' }
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('libraryToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
=======
// src/services/api.js
// All API calls to Spring Boot backend.
// Interceptors log every request/response to the browser console.

import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8081/api',
  headers: { 'Content-Type': 'application/json' }
});

// ── Console logging interceptors ────────────────────────────────
API.interceptors.request.use(config => {
  console.log(
    '%c🚀 [API] ' + config.method.toUpperCase() + ' ' + config.url,
    'color:#3182ce;font-weight:bold'
  );
>>>>>>> 60faa2c4c152355fe3b9d243f7e2a2107b30455d
  return config;
});

API.interceptors.response.use(
<<<<<<< HEAD
  response => response,
  error => {
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem('libraryToken');
      localStorage.removeItem('libraryUser');
      window.location.href = '/';
    }
=======
  response => {
    console.log(
      '%c✅ [API] ' + response.config.method.toUpperCase() + ' ' + response.config.url +
      ' → ' + response.status + ' OK',
      'color:#38a169;font-weight:bold'
    );
    return response;
  },
  error => {
    console.error(
      '❌ [API] ' + (error.config?.method?.toUpperCase() || '?') +
      ' ' + (error.config?.url || '') +
      ' → ' + (error.response?.status || 'Network Error') +
      ': ' + JSON.stringify(error.response?.data || error.message)
    );
>>>>>>> 60faa2c4c152355fe3b9d243f7e2a2107b30455d
    return Promise.reject(error);
  }
);

<<<<<<< HEAD
// ── AUTH ─────────────────────────────────────────────────────────
export const login               = (email, password)          => API.post('/auth/login', { email, password });
export const registerStudent     = (data)                     => API.post('/auth/register/student', data);
export const registerFaculty     = (data)                     => API.post('/auth/register/faculty', data);
export const forgotPassword      = (email)                    => API.post('/auth/forgot-password', { email });
export const resetPassword       = (token, newPassword)       => API.post('/auth/reset-password', { token, newPassword });
export const changePassword      = (email, oldPwd, newPwd)    =>
  API.post('/auth/change-password', null, { params: { email, oldPassword: oldPwd, newPassword: newPwd } });
export const adminChangePassword = (email, newPassword)       => API.post('/auth/admin/change-password', { email, newPassword });
export const createAdmin         = (data)                     => API.post('/auth/admin/create-admin', data);

// ── BOOKS ─────────────────────────────────────────────────────────
export const getBooks         = ()         => API.get('/books');
export const getBook          = (id)       => API.get(`/books/${id}`);
export const addBook          = (book)     => API.post('/books', book);
export const updateBook       = (id, book) => API.put(`/books/${id}`, book);
export const deleteBook       = (id)       => API.delete(`/books/${id}`);
export const searchBooks      = (params)   => API.get('/books/search', { params });
export const getBookCopies    = (id)       => API.get(`/books/${id}/copies`);
export const addBookCopy      = (id, copy) => API.post(`/books/${id}/copies`, copy);
export const getBookCopyStats = (id)       => API.get(`/books/${id}/copies/stats`);  // NEW
export const deleteBookCopy   = (copyId)   => API.delete(`/books/copies/${copyId}`); // NEW

// ── USERS ─────────────────────────────────────────────────────────
export const getStudents   = ()       => API.get('/users/students');
export const getFaculty    = ()       => API.get('/users/faculty');
export const updateStudent = (id, s)  => API.put(`/users/students/${id}`, s);
export const updateFaculty = (id, f)  => API.put(`/users/faculty/${id}`, f);
export const deleteUser    = (id)     => API.delete(`/users/${id}`);

// ── BORROW ────────────────────────────────────────────────────────
=======
// ── BOOKS ────────────────────────────────────────────────────────
export const getBooks      = ()         => API.get('/books');
export const getBook       = (id)       => API.get(`/books/${id}`);
export const addBook       = (book)     => API.post('/books', book);
export const updateBook    = (id, book) => API.put(`/books/${id}`, book);
export const deleteBook    = (id)       => API.delete(`/books/${id}`);
export const searchBooks   = (params)   => API.get('/books/search', { params });
export const getBookCopies = (id)       => API.get(`/books/${id}/copies`);
export const addBookCopy   = (id, copy) => API.post(`/books/${id}/copies`, copy);

// ── USERS ────────────────────────────────────────────────────────
export const getStudents   = ()        => API.get('/users/students');
export const getFaculty    = ()        => API.get('/users/faculty');
export const addStudent    = (s)       => API.post('/users/students', s);
export const addFaculty    = (f)       => API.post('/users/faculty', f);
export const updateStudent = (id, s)   => API.put(`/users/students/${id}`, s);
export const updateFaculty = (id, f)   => API.put(`/users/faculty/${id}`, f);
export const deleteUser    = (id)      => API.delete(`/users/${id}`);

// ── BORROW ───────────────────────────────────────────────────────
>>>>>>> 60faa2c4c152355fe3b9d243f7e2a2107b30455d
export const borrowBook       = (userId, bookId) => API.post('/borrow', { userId, bookId });
export const returnBook       = (txId)           => API.post(`/borrow/${txId}/return`);
export const getUserBorrows   = (userId)         => API.get(`/borrow/user/${userId}`);
export const getActiveBorrows = (userId)         => API.get(`/borrow/user/${userId}/active`);
export const getOverdue       = ()               => API.get('/borrow/overdue');

<<<<<<< HEAD
// ── FINES ─────────────────────────────────────────────────────────
=======
// ── FINES (amounts in EUR €) ─────────────────────────────────────
>>>>>>> 60faa2c4c152355fe3b9d243f7e2a2107b30455d
export const getUserFines   = (userId) => API.get(`/fines/user/${userId}`);
export const getUnpaidFines = (userId) => API.get(`/fines/user/${userId}/unpaid`);
export const payFine        = (fineId) => API.post(`/fines/${fineId}/pay`);

<<<<<<< HEAD
// ── CHATBOT ───────────────────────────────────────────────────────
export const chatbot = (message, userId) => API.post('/chatbot', { message, userId });

// ── PRE-BORROW (Reservations) ─────────────────────────────────────
export const placePreborrow          = (userId, bookId) => API.post('/preborrow', { userId, bookId });
export const cancelPreborrow         = (id, userId)     => API.post(`/preborrow/${id}/cancel`, { userId });
export const fulfilPreborrow         = (id, userId)     => API.post(`/preborrow/${id}/fulfil`, { userId });
export const adminApprovePreborrow   = (id)             => API.post(`/preborrow/${id}/approve`);
export const getUserPreborrows       = (userId)         => API.get(`/preborrow/user/${userId}`);
export const getUserActivePreborrows = (userId)         => API.get(`/preborrow/user/${userId}/active`);
export const getAllPreborrows         = ()               => API.get('/preborrow');
export const getAllPendingPreborrows  = ()               => API.get('/preborrow/pending');

// ── FINES — all (for history) ─────────────────────────────────────
export const getAllUserFines = (userId) => API.get(`/fines/user/${userId}`);
=======
// ── CHATBOT ──────────────────────────────────────────────────────
export const chatbot = (message, userId) => API.post('/chatbot', { message, userId });
>>>>>>> 60faa2c4c152355fe3b9d243f7e2a2107b30455d
