CREATE TABLE borrowed_books (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    book_id INT REFERENCES books(id) ON DELETE CASCADE,
    borrowed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_returned BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (user_id, book_id,borrowed_date)
);