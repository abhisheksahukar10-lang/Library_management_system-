-- ============================================================
--  Library Management System — Seed Data
--  Run AFTER starting the backend (tables are auto-created)
--
--  Usage:
--    psql -U postgres -d library_db -f database/seed_books.sql
-- ============================================================

-- Clear existing data
TRUNCATE TABLE books RESTART IDENTITY CASCADE;

-- Insert 20 books
INSERT INTO books (title, author, isbn, genre, publisher, published_year, description, in_library_hours_limit, restricted_from_removal) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 'Classic Fiction', 'Scribner', 1925, 'A story of the fabulously wealthy Jay Gatsby and his love for Daisy Buchanan.', 4, false),
('To Kill a Mockingbird', 'Harper Lee', '9780061935466', 'Classic Fiction', 'HarperCollins', 1960, 'A story of racial injustice and childhood innocence in the American South.', 4, false),
('1984', 'George Orwell', '9780451524935', 'Dystopian Fiction', 'Signet Classic', 1949, 'A chilling prophecy about the future under a totalitarian surveillance state.', 4, false),
('Harry Potter and the Sorcerers Stone', 'J.K. Rowling', '9780439708180', 'Fantasy', 'Scholastic', 1997, 'A young boy discovers he is a wizard and enrolls in Hogwarts School of Witchcraft.', 6, false),
('The Alchemist', 'Paulo Coelho', '9780062315007', 'Philosophical Fiction', 'HarperOne', 1988, 'A shepherd boy travels from Spain to Egypt in search of treasure and his destiny.', 3, false),
('Brave New World', 'Aldous Huxley', '9780060850524', 'Dystopian Fiction', 'Harper Perennial', 1932, 'A futuristic society where humans are engineered and conditioned for social stability.', 4, false),
('The Da Vinci Code', 'Dan Brown', '9780307474278', 'Mystery Thriller', 'Anchor Books', 2003, 'A symbologist uncovers a secret that could shake the foundations of Christianity.', 5, false),
('A Brief History of Time', 'Stephen Hawking', '9780553380163', 'Science', 'Bantam Books', 1988, 'An exploration of cosmology, black holes, and the origins of the universe.', 6, true),
('The Catcher in the Rye', 'J.D. Salinger', '9780316769174', 'Classic Fiction', 'Little Brown', 1951, 'A teenager narrates his experiences after being expelled from prep school.', 4, false),
('Pride and Prejudice', 'Jane Austen', '9780141439518', 'Romance Classic', 'Penguin Classics', 1813, 'The story of Elizabeth Bennet and her complicated relationship with Mr. Darcy.', 4, false),
('The Hobbit', 'J.R.R. Tolkien', '9780547928227', 'Fantasy', 'Houghton Mifflin', 1937, 'Bilbo Baggins goes on an unexpected adventure with a group of dwarves.', 5, false),
('Clean Code', 'Robert C. Martin', '9780132350884', 'Technology', 'Prentice Hall', 2008, 'A handbook of agile software craftsmanship and best coding practices.', 8, true),
('Introduction to Algorithms', 'Thomas H. Cormen', '9780262033848', 'Computer Science', 'MIT Press', 2009, 'A comprehensive textbook covering a broad range of algorithms in depth.', 8, true),
('Sapiens', 'Yuval Noah Harari', '9780062316097', 'History', 'Harper Perennial', 2011, 'A brief history of humankind from the Stone Age to the modern era.', 5, false),
('Atomic Habits', 'James Clear', '9780735211292', 'Self Help', 'Avery Publishing', 2018, 'A practical guide to building good habits and breaking bad ones.', 4, false),
('The Lean Startup', 'Eric Ries', '9780307887894', 'Business', 'Crown Business', 2011, 'How entrepreneurs use continuous innovation to create successful businesses.', 5, false),
('Don Quixote', 'Miguel de Cervantes', '9780060934347', 'Classic Fiction', 'HarperCollins', 1605, 'The adventures of a self-styled knight and his loyal squire Sancho Panza.', 4, false),
('Crime and Punishment', 'Fyodor Dostoevsky', '9780143107637', 'Classic Fiction', 'Penguin Classics', 1866, 'A young man commits a murder and struggles with guilt and redemption.', 4, false),
('The Art of War', 'Sun Tzu', '9781590302255', 'Philosophy', 'Shambhala Publications', 500, 'An ancient Chinese military treatise on strategy and tactics.', 3, false),
('Thinking Fast and Slow', 'Daniel Kahneman', '9780374533557', 'Psychology', 'Farrar Straus Giroux', 2011, 'Explores the two systems of thinking that drive the way humans make decisions.', 5, false);

-- Auto-create 1 AVAILABLE copy for each book
INSERT INTO book_copies (book_id, copy_code, status)
SELECT id, 'BOOK' || id || '-COPY1', 'AVAILABLE'
FROM books;
