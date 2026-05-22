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
  return config;
});

API.interceptors.response.use(
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
    return Promise.reject(error);
  }
);

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
export const borrowBook       = (userId, bookId) => API.post('/borrow', { userId, bookId });
export const returnBook       = (txId)           => API.post(`/borrow/${txId}/return`);
export const getUserBorrows   = (userId)         => API.get(`/borrow/user/${userId}`);
export const getActiveBorrows = (userId)         => API.get(`/borrow/user/${userId}/active`);
export const getOverdue       = ()               => API.get('/borrow/overdue');

// ── FINES (amounts in EUR €) ─────────────────────────────────────
export const getUserFines   = (userId) => API.get(`/fines/user/${userId}`);
export const getUnpaidFines = (userId) => API.get(`/fines/user/${userId}/unpaid`);
export const payFine        = (fineId) => API.post(`/fines/${fineId}/pay`);

// ── CHATBOT ──────────────────────────────────────────────────────
export const chatbot = (message, userId) => API.post('/chatbot', { message, userId });
