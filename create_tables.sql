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

-- OrderItem Table
DROP TABLE IF EXISTS order_item CASCADE;
CREATE TABLE order_item (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    menu_item_id INT NOT NULL REFERENCES menu_item(menu_item_id),
    quantity INT NOT NULL CHECK (quantity > 0),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0)
);

-- Payment Table
DROP TABLE IF EXISTS payment CASCADE;
CREATE TABLE payment (
    payment_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(order_id),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(20) NOT NULL,
    card_details_id INT REFERENCES card_details(card_details_id),
    bank_account_id INT NOT NULL REFERENCES bank_account(bank_account_id),
    CHECK (
        (payment_method = 'Card' AND card_details_id IS NOT NULL) OR
        (payment_method != 'Card' AND card_details_id IS NULL)
    )
);

-- BankAccount Table
DROP TABLE IF EXISTS bank_account CASCADE;
CREATE TABLE bank_account (
    bank_account_id SERIAL PRIMARY KEY,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    account_holder_name VARCHAR(100) NOT NULL,
    balance DECIMAL(15, 2) NOT NULL CHECK (balance >= 0)
);

-- CardDetails Table
DROP TABLE IF EXISTS card_details CASCADE;
CREATE TABLE card_details (
    card_details_id SERIAL PRIMARY KEY,
    card_number VARCHAR(16) UNIQUE NOT NULL,
    expiry_date DATE NOT NULL,
    card_holder_name VARCHAR(100) NOT NULL,
    bank_account_id INT NOT NULL REFERENCES bank_account(bank_account_id)
);

-- Employee Table
DROP TABLE IF EXISTS employee CASCADE;
CREATE TABLE employee (
    employee_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL,
    restaurant_id INT NOT NULL REFERENCES restaurant(restaurant_id)
);

-- Receipt Table
DROP TABLE IF EXISTS receipt CASCADE;
CREATE TABLE receipt (
    receipt_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(order_id),
    receipt_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_order_item_order_id ON order_item(order_id);
CREATE INDEX idx_order_item_menu_item_id ON order_item(menu_item_id);
CREATE INDEX idx_payment_order_id ON payment(order_id);
CREATE INDEX idx_payment_bank_account_id ON payment(bank_account_id);
CREATE INDEX idx_payment_card_details_id ON payment(card_details_id);
CREATE INDEX idx_card_details_bank_account_id ON card_details(bank_account_id);
CREATE INDEX idx_employee_restaurant_id ON employee(restaurant_id);
