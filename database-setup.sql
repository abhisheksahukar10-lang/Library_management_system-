-- ================================================================
-- Library Management System v2 — Database Setup
-- Java 21 + Spring Security + JWT Authentication
-- ================================================================

-- Step 1: Create database (run as postgres superuser)
CREATE DATABASE library_db;

-- ================================================================
-- UPGRADING FROM v1? Run these to migrate existing schema:
-- ================================================================

-- Add password column if missing (v1 had it removed, v2 needs it)
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS password VARCHAR(255) NOT NULL DEFAULT '$2a$10$placeholder';
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'STUDENT';

-- Create admins table if missing (v2 new)
CREATE TABLE IF NOT EXISTS admins (id BIGINT PRIMARY KEY REFERENCES users(id));

-- ================================================================
-- FRESH START: Drop and recreate (WARNING: deletes ALL data)
-- ================================================================
-- DROP DATABASE IF EXISTS library_db;
-- CREATE DATABASE library_db;
-- (Restart Spring Boot — Hibernate creates all tables + seeds admin)

-- ================================================================
-- Default credentials seeded automatically on first boot:
--   Admin:   admin@library.com  /  Admin@123
-- ================================================================
