CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(17) UNIQUE NOT NULL,
    available_quantity INT NOT NULL CHECK (available_quantity >= 0),
    shelf_location VARCHAR(50)
);