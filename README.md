# 📚 UniLibrary — Library Management System

## Tech Stack
- **Backend:** Java 21 + Spring Boot 3.3 + JWT + PostgreSQL
- **Frontend:** React 18 + Axios

---

## ⚡ Quick Start

### 1. Prerequisites
| Tool | Version |
|------|---------|
| Java JDK | 21 |
| Maven | Latest |
| Node.js | 16+ |
| PostgreSQL | Latest |

---

### 2. Database Setup
Open pgAdmin or psql and create the database:
```sql
CREATE DATABASE library_db;
```

---

### 3. Configure Backend
Edit `backend/src/main/resources/application.properties`:

```properties
# Update your PostgreSQL password
spring.datasource.password=YOUR_POSTGRES_PASSWORD

# Update Gmail for password-reset emails
spring.mail.username=YOUR_GMAIL@gmail.com
spring.mail.password=YOUR_GMAIL_APP_PASSWORD
```

> **Gmail App Password:** Google Account → Security → 2-Step Verification → App Passwords

---

### 4. Run Backend
```bash
cd backend
mvnw spring-boot:run
```
Backend starts on **http://localhost:8080**

---

### 5. Run Frontend
```bash
cd frontend
npm install
npm start
```
Frontend opens at **http://localhost:3000**

---

### 6. Seed Book Data (Optional)
After the backend has started (tables are auto-created), run:
```bash
psql -U postgres -d library_db -f database/seed_books.sql
```
Or paste the contents of `database/seed_books.sql` into pgAdmin Query Tool and execute.

This inserts 20 sample books into the database.

---

## 📁 Project Structure
```
library-v4/
├── backend/                  ← Spring Boot API
│   └── src/main/resources/
│       └── application.properties  ← DB & email config
├── frontend/                 ← React App
│   └── src/pages/
│       ├── AdminDashboard.jsx
│       ├── Books.jsx         ← Shows Available/Borrowed/Total per book
│       └── ...
└── database/
    └── seed_books.sql        ← 20 sample books
```

---

## 🔧 Common Issues
| Problem | Fix |
|---------|-----|
| Port 8080 in use | Change `server.port` in application.properties |
| DB password error | Update password in application.properties |
| npm install fails | Ensure Node.js ≥ 16 |
| Java version error | Confirm `java -version` shows Java 21 |
| Email not sending | Use Gmail App Password, not your regular password |
