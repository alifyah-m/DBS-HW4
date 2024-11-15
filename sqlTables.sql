-- =========================
-- Database Schema Creation
-- =========================

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

-- =========================
-- Data Population
-- =========================

-- Populating the BankAccount Table
INSERT INTO bank_account (account_number, account_holder_name, balance) VALUES
('BA1234567890', 'NehAlifs BBQ Corporate Account', 100000.00),  -- bank_account_id = 1
('BA1234567891', 'Alice Green Account', 5000.00),               -- bank_account_id = 2
('BA1234567892', 'Bob White Account', 3000.00),                 -- bank_account_id = 3
('BA1234567893', 'Charlie Brown Account', 4000.00),             -- bank_account_id = 4
('BA1234567894', 'Diana Prince Account', 3500.00),              -- bank_account_id = 5
('BA1234567895', 'Ethan Hunt Account', 4500.00),                -- bank_account_id = 6
('BA1234567896', 'Fiona Shaw Account', 3200.00),                -- bank_account_id = 7
('BA1234567897', 'George Miller Account', 2800.00),             -- bank_account_id = 8
('BA1234567898', 'Hannah Smith Account', 3600.00),              -- bank_account_id = 9
('BA1234567899', 'Ian Wright Account', 4100.00);                -- bank_account_id = 10

-- Populating the Restaurant Table
INSERT INTO restaurant (name, location, food_kind) VALUES
('NehAlifs BBQ Downtown', '123 Main St', 'Texan'),            -- restaurant_id = 1
('NehAlifs BBQ Uptown', '456 Elm St', 'Texan'),               -- restaurant_id = 2
('NehAlifs BBQ Eastside', '789 Oak Ave', 'Texan'),            -- restaurant_id = 3
('NehAlifs BBQ Westside', '101 Maple Rd', 'Texan'),           -- restaurant_id = 4
('NehAlifs BBQ Southside', '202 Pine St', 'Texan'),           -- restaurant_id = 5
('NehAlifs BBQ Northside', '303 Cedar Ave', 'Texan'),         -- restaurant_id = 6
('NehAlifs BBQ Lakeside', '404 Lake Dr', 'Texan'),            -- restaurant_id = 7
('NehAlifs BBQ Hilltop', '505 Hill St', 'Texan'),             -- restaurant_id = 8
('NehAlifs BBQ Riverside', '606 River Rd', 'Texan'),          -- restaurant_id = 9
('NehAlifs BBQ Mountain View', '707 Mountain Ave', 'Texan');  -- restaurant_id = 10

-- Populating the Customer Table
INSERT INTO customer (first_name, last_name, email, phone, loyalty_card_number) VALUES
('Alice', 'Green', 'alice.green@example.com', '1234567890', 'LC1001'),    -- customer_id = 1
('Bob', 'White', 'bob.white@example.com', '0987654321', 'LC1002'),        -- customer_id = 2
('Charlie', 'Brown', 'charlie.brown@example.com', '2345678901', 'LC1003'),-- customer_id = 3
('Diana', 'Prince', 'diana.prince@example.com', '3456789012', 'LC1004'),  -- customer_id = 4
('Ethan', 'Hunt', 'ethan.hunt@example.com', '4567890123', 'LC1005'),      -- customer_id = 5
('Fiona', 'Shaw', 'fiona.shaw@example.com', '5678901234', 'LC1006'),      -- customer_id = 6
('George', 'Miller', 'george.miller@example.com', '6789012345', 'LC1007'),-- customer_id = 7
('Hannah', 'Smith', 'hannah.smith@example.com', '7890123456', 'LC1008'),  -- customer_id = 8
('Ian', 'Wright', 'ian.wright@example.com', '8901234567', 'LC1009'),      -- customer_id = 9
('Julia', 'Stone', 'julia.stone@example.com', '9012345678', 'LC1010');    -- customer_id = 10

-- Populating the MenuItem Table
INSERT INTO menu_item (name, description, price, category) VALUES
('Brisket Sandwich', 'Smoked brisket with BBQ sauce', 9.99, 'Main Course'),       -- menu_item_id = 1
('Pulled Pork Sandwich', 'Pulled pork with coleslaw', 8.99, 'Main Course'),       -- menu_item_id = 2
('BBQ Ribs', 'Half rack of ribs', 12.99, 'Main Course'),                          -- menu_item_id = 3
('Grilled Chicken', 'Marinated grilled chicken breast', 10.99, 'Main Course'),    -- menu_item_id = 4
('Texas Sausage', 'Smoked sausage links', 7.99, 'Main Course'),                   -- menu_item_id = 5
('Garden Salad', 'Fresh mixed greens with dressing', 6.99, 'Appetizer'),          -- menu_item_id = 6
('Fried Pickles', 'Crispy fried pickles with ranch', 5.99, 'Appetizer'),          -- menu_item_id = 7
('Cornbread', 'Homemade cornbread', 3.99, 'Side'),                                -- menu_item_id = 8
('Baked Beans', 'Slow-cooked beans with bacon', 4.99, 'Side'),                    -- menu_item_id = 9
('Coleslaw', 'Creamy coleslaw', 3.49, 'Side'),                                    -- menu_item_id = 10
('Mac and Cheese', 'Cheesy macaroni', 4.99, 'Side'),                              -- menu_item_id = 11
('Peach Cobbler', 'Sweet peach dessert', 4.50, 'Dessert'),                        -- menu_item_id = 12
('Pecan Pie', 'Classic pecan pie slice', 4.75, 'Dessert'),                        -- menu_item_id = 13
('Iced Tea', 'Sweet iced tea', 2.50, 'Beverage'),                                 -- menu_item_id = 14
('Lemonade', 'Freshly squeezed lemonade', 2.75, 'Beverage');                      -- menu_item_id = 15

-- Populating the Employee Table
INSERT INTO employee (first_name, last_name, role, restaurant_id) VALUES
('John', 'Doe', 'Manager', 1),
('Jane', 'Smith', 'Chef', 2),
('Mike', 'Johnson', 'Waiter', 3),
('Emily', 'Davis', 'Waitress', 4),
('Robert', 'Brown', 'Manager', 5),
('Linda', 'Williams', 'Chef', 6),
('David', 'Wilson', 'Waiter', 7),
('Susan', 'Moore', 'Waitress', 8),
('Thomas', 'Taylor', 'Manager', 9),
('Karen', 'Anderson', 'Chef', 10);

-- Populating the CardDetails Table
INSERT INTO card_details (card_number, expiry_date, card_holder_name, bank_account_id) VALUES
('4111111111111111', '2025-12-31', 'Alice Green', 2),
('5500000000000004', '2024-11-30', 'Bob White', 3),
('340000000000009', '2026-01-31', 'Charlie Brown', 4),
('30000000000004', '2023-10-31', 'Diana Prince', 5),
('6011000000000004', '2027-05-31', 'Ethan Hunt', 6),
('3530111333300000', '2025-08-31', 'Fiona Shaw', 7),
('6304000000000000', '2024-09-30', 'George Miller', 8),
('6221260000000000', '2026-07-31', 'Hannah Smith', 9),
('6759000000000000', '2025-03-31', 'Ian Wright', 10),
('5000000000000009', '2024-12-31', 'Julia Stone', 10);

-- Populating the Orders Table
INSERT INTO orders (customer_id, restaurant_id, order_date, total_amount, payment_status) VALUES
(1, 1, '2023-11-01 12:00:00', 25.97, 'Unpaid'),
(2, 2, '2023-11-02 13:15:00', 18.98, 'Unpaid'),
(3, 3, '2023-11-03 14:30:00', 32.97, 'Unpaid'),
(4, 4, '2023-11-04 15:45:00', 22.98, 'Unpaid'),
(5, 5, '2023-11-05 17:00:00', 19.98, 'Unpaid'),
(6, 6, '2023-11-06 18:15:00', 28.97, 'Unpaid'),
(7, 7, '2023-11-07 19:30:00', 24.98, 'Unpaid'),
(8, 8, '2023-11-08 20:45:00', 21.98, 'Unpaid'),
(9, 9, '2023-11-09 12:30:00', 29.97, 'Unpaid'),
(10, 10, '2023-11-10 13:45:00', 26.98, 'Unpaid');

-- Populating the OrderItem Table
INSERT INTO order_item (order_id, menu_item_id, quantity, price) VALUES
(1, 1, 2, 9.99),
(1, 6, 1, 6.99),
(2, 2, 1, 8.99),
(2, 7, 1, 5.99),
(3, 3, 2, 12.99),
(3, 8, 1, 3.99),
(4, 4, 1, 10.99),
(4, 9, 1, 4.99),
(5, 5, 1, 7.99),
(5, 10, 1, 3.49),
(6, 1, 1, 9.99),
(6, 11, 1, 4.99),
(7, 2, 2, 8.99),
(7, 12, 1, 4.50),
(8, 3, 1, 12.99),
(8, 13, 1, 4.75),
(9, 4, 2, 10.99),
(9, 14, 2, 2.50),
(10, 5, 1, 7.99),
(10, 15, 1, 2.75);

-- Updating the total_amount in Orders based on OrderItems
UPDATE orders SET total_amount = (
    SELECT SUM(price * quantity) FROM order_item WHERE order_item.order_id = orders.order_id
);

-- Populating the Payment Table
INSERT INTO payment (order_id, amount, payment_method, card_details_id, bank_account_id) VALUES
(1, 25.97, 'Card', 1, 2),
(2, 18.98, 'Card', 2, 3),
(3, 32.97, 'Card', 3, 4),
(4, 22.98, 'Card', 4, 5),
(5, 19.98, 'Card', 5, 6),
(6, 28.97, 'Card', 6, 7),
(7, 24.98, 'Card', 7, 8),
(8, 21.98, 'Card', 8, 9),
(9, 29.97, 'Card', 9, 10),
(10, 26.98, 'Card', 10, 10);

-- Updating the payment_status in Orders to 'Paid'
UPDATE orders SET payment_status = 'Paid';

-- Adjusting bank account balances
-- Deducting from customers' accounts
UPDATE bank_account SET balance = balance - sub.amount
FROM (
    SELECT bank_account_id, amount FROM payment WHERE bank_account_id != 1
) AS sub
WHERE bank_account.bank_account_id = sub.bank_account_id;

-- Adding to company's account (assuming bank_account_id = 1)
UPDATE bank_account SET balance = balance + (
    SELECT SUM(amount) FROM payment
) WHERE bank_account_id = 1;

-- Populating the Receipt Table
INSERT INTO receipt (order_id) VALUES
(1),(2),(3),(4),(5),(6),(7),(8),(9),(10);
