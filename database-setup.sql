-- ================================================================
-- Library Management System — Database Setup
-- Run this ONCE before starting the application
-- ================================================================

-- Step 1: Create database (run as postgres superuser)
CREATE DATABASE library_db;

-- ================================================================
-- IF YOU ARE UPGRADING FROM AN OLDER VERSION:
-- Run these ALTER statements to fix schema issues
-- ================================================================

-- Remove old 'password' column if it exists (from old schema)
-- This is REQUIRED if you ran the old version that had passwords
ALTER TABLE IF EXISTS users DROP COLUMN IF EXISTS password;

-- If user_type column doesn't exist yet (Hibernate will add it,
-- but if you get a 'column does not exist' error on startup, run:)
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type VARCHAR(31);
-- UPDATE users SET user_type = 'STUDENT' WHERE id IN (SELECT id FROM students);
-- UPDATE users SET user_type = 'FACULTY' WHERE id IN (SELECT id FROM faculty);

-- ================================================================
-- FRESH START: Drop everything and recreate (use when needed)
-- WARNING: This deletes ALL your data
-- ================================================================
-- DROP DATABASE IF EXISTS library_db;
-- CREATE DATABASE library_db;
-- (Then restart Spring Boot — it creates all tables automatically)
