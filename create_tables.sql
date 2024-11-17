-- create_tables.sql

-- Restaurant Table
DROP TABLE IF EXISTS restaurant CASCADE;
CREATE TABLE restaurant (
    restaurant_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    food_kind VARCHAR(50) NOT NULL
);

-- Customer Table
DROP TABLE IF EXISTS customer CASCADE;
CREATE TABLE customer (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    loyalty_card_number VARCHAR(20) UNIQUE
);

-- MenuItem Table
DROP TABLE IF EXISTS menu_item CASCADE;
CREATE TABLE menu_item (
    menu_item_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    category VARCHAR(50) NOT NULL
);

-- Orders Table
DROP TABLE IF EXISTS orders CASCADE;
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customer(customer_id),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) CHECK (total_amount >= 0),
    payment_status VARCHAR(20) NOT NULL,
    restaurant_id INT NOT NULL REFERENCES restaurant(restaurant_id)
);

-- Other tables omitted for brevity
