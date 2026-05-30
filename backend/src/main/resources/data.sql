-- =========================================
-- BOOKS
-- =========================================

INSERT INTO books
(title, author, isbn, genre, publisher, published_year, description, restricted_from_removal, in_library_hours_limit)
VALUES
('Clean Code', 'Robert C. Martin', '9780132350884', 'Programming', 'Prentice Hall', 2008,
 'Guide to writing clean and maintainable code.', false, 0),

('Introduction to Algorithms', 'Thomas H. Cormen', '9780262033848', 'Algorithms', 'MIT Press', 2009,
 'Comprehensive algorithms textbook.', false, 0),

('Operating System Concepts', 'Abraham Silberschatz', '9781118063330', 'Operating Systems', 'Wiley', 2018,
 'Classic operating systems textbook.', false, 0),

('Database System Concepts', 'Henry F. Korth', '9780073523323', 'Database', 'McGraw Hill', 2019,
 'Database management system concepts.', false, 0),

('Artificial Intelligence: A Modern Approach', 'Stuart Russell', '9780134610993',
 'Artificial Intelligence', 'Pearson', 2021,
 'Popular AI textbook.', false, 0);



-- =========================================
-- USERS (COMMON FIELDS)
-- =========================================

INSERT INTO users (user_type, name, email, phone)
VALUES

('STUDENT', 'Veerbhadrasinh Gohil', 'veerbhadrasinh@example.com', '9876543210'),
('STUDENT', 'Yash Gawari', 'yash.gawari@example.com', '9876543211'),
('STUDENT', 'Abhishek Sahukar', 'abhishek.sahukar@example.com', '9876543212'),
('STUDENT', 'Uvesh Khan', 'uvesh.khan@example.com', '9876543213'),
('STUDENT', 'Neha Doggalli', 'neha.doggalli@example.com', '9876543214'),

('FACULTY', 'Professor Ajinkya', 'ajinkya@university.edu', '9876543220'),
('FACULTY', 'Professor Reshadi', 'reshadi@university.edu', '9876543221'),
('FACULTY', 'Professor Gerd', 'gerd@university.edu', '9876543222');



-- =========================================
-- STUDENTS
-- =========================================

INSERT INTO students (id, student_id, department, semester)
VALUES

(1, 'S101', 'Computer Science', 2),
(2, 'S102', 'Computer Science', 2),
(3, 'S103', 'Computer Science', 2),
(4, 'S104', 'Computer Science', 2),
(5, 'S105', 'Computer Science', 2);



-- =========================================
-- FACULTY
-- =========================================

INSERT INTO faculty (id, employee_id, department)
VALUES

(6, 'F101', 'Computer Science'),
(7, 'F102', 'Computer Science'),
(8, 'F103', 'Computer Science');



-- =========================================
-- BOOK COPIES
-- =========================================

INSERT INTO book_copies (copy_code, status, book_id)
VALUES

('CC-001', 'AVAILABLE', 1),
('CC-002', 'BORROWED', 1),

('ALG-001', 'AVAILABLE', 2),
('ALG-002', 'AVAILABLE', 2),

('OS-001', 'AVAILABLE', 3),

('DBMS-001', 'BORROWED', 4),

('AI-001', 'AVAILABLE', 5),
('AI-002', 'AVAILABLE', 5);



-- =========================================
-- BORROW TRANSACTIONS
-- =========================================

INSERT INTO borrow_transactions
(user_id, book_copy_id, borrow_date, due_date, returned, in_library_hours)
VALUES

-- Student 1 overdue
(
1,
2,
CURRENT_DATE - INTERVAL '20 days',
CURRENT_DATE - INTERVAL '5 days',
false,
0
),

-- Student 3 active
(
3,
6,
CURRENT_DATE - INTERVAL '2 days',
CURRENT_DATE + INTERVAL '12 days',
false,
0
),

-- Student 2 overdue
(
2,
3,
CURRENT_DATE - INTERVAL '15 days',
CURRENT_DATE - INTERVAL '2 days',
false,
0
);


-- =========================================
-- FINES
-- =========================================

INSERT INTO fines
(user_id, transaction_id, overdue_days, fine_amount_per_day, total_amount, paid, fine_date)
VALUES

(
1,
1,
5,
1.00,
5.00,
false,
CURRENT_DATE
),

(
2,
3,
2,
1.00,
2.00,
false,
CURRENT_DATE
);