// server.js

const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Database connection configuration
const pool = new Pool({
    user: 'postgres',          // Replace with your PostgreSQL username
    host: 'localhost',
    database: 'NehAlif_dash',  // Ensure this database exists
    password: '2201',          // Replace with your PostgreSQL password
    port: 5432,
});

// ======================
// API Endpoints
// ======================

// Create Tables Endpoint
app.post('/create-tables', async (req, res) => {
    try {
        const createTablesSql = fs.readFileSync('create_tables.sql').toString();
        await pool.query(createTablesSql);
        res.status(200).json({ message: 'Tables created successfully.' });
    } catch (err) {
        console.error('Error creating tables:', err.message);
        res.status(500).json({ error: 'Failed to create tables' });
    }
});

// Initialize Database Endpoint
app.post('/initialize-db', async (req, res) => {
    try {
        const populateTablesSql = fs.readFileSync('populate_tables.sql').toString();
        await pool.query(populateTablesSql);
        res.status(200).json({ message: 'Database initialized successfully.' });
    } catch (err) {
        console.error('Error initializing database:', err.message);
        res.status(500).json({ error: 'Failed to initialize database' });
    }
});

// Delete All Rows Endpoint
app.delete('/delete-rows/:tableName', async (req, res) => {
    const { tableName } = req.params;
    try {
        await pool.query(`DELETE FROM ${tableName}`);
        res.status(200).json({ message: `All rows deleted from ${tableName}.` });
    } catch (err) {
        console.error(`Error deleting rows from ${tableName}:`, err.message);
        res.status(500).json({ error: `Failed to delete rows from ${tableName}` });
    }
});

// Browse Data Endpoint
app.get('/browse/:tableName', async (req, res) => {
    const { tableName } = req.params;
    try {
        const result = await pool.query(`SELECT * FROM ${tableName} LIMIT 10`);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(`Error browsing data from ${tableName}:`, err.message);
        res.status(500).json({ error: `Failed to browse data from ${tableName}` });
    }
});

app.get('/menu', async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT menu_item_id, name, description, price::float, category FROM menu_item'
      );
      res.status(200).json(result.rows);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      res.status(500).json({ error: 'Failed to fetch menu items' });
    }
  });
  

// Add New Menu Item
app.post('/menu-items', async (req, res) => {
    const { name, description, price, category } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO menu_item (name, description, price, category) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, description, price, category]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error adding menu item:', err.message);
        res.status(500).json({ error: 'Server error while adding menu item' });
    }
});

// Get All Orders
app.get('/orders', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM orders');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching orders:', err.message);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Get All Payments
app.get('/payments', async (req, res) => {
    try {
        const result = await pool.query('SELECT *, amount::float FROM payment');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching payments:', err.message);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});

// Get All Bank Accounts
app.get('/bank-accounts', async (req, res) => {
    try {
        const result = await pool.query('SELECT *, balance::float FROM bank_account');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching bank accounts:', err.message);
        res.status(500).json({ error: 'Failed to fetch bank accounts' });
    }
});

// Add New Bank Account
app.post('/bank-accounts', async (req, res) => {
    const { account_number, account_holder_name, balance } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO bank_account (account_number, account_holder_name, balance) VALUES ($1, $2, $3) RETURNING *',
            [account_number, account_holder_name, balance]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error adding bank account:', err.message);
        res.status(500).json({ error: 'Server error while adding bank account' });
    }
});

// Place an order
app.post('/place-order', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { customer_id, restaurant_id, items } = req.body;

        // Insert into orders table
        const orderResult = await client.query(
            `INSERT INTO orders (customer_id, restaurant_id, payment_status) 
             VALUES ($1, $2, 'Unpaid') RETURNING order_id`,
            [customer_id, restaurant_id]
        );
        const order_id = orderResult.rows[0].order_id;

        // Insert into order_item table
        for (const item of items) {
            await client.query(
                `INSERT INTO order_item (order_id, menu_item_id, quantity, price)
                 VALUES ($1, $2, $3, $4)`,
                [order_id, item.menu_item_id, item.quantity, item.price]
            );
        }

        // Update total_amount in orders table
        const totalResult = await client.query(
            `SELECT COALESCE(SUM(quantity * price), 0) AS total_amount FROM order_item WHERE order_id = $1`,
            [order_id]
        );
        const total_amount = totalResult.rows[0].total_amount;

        await client.query(
            `UPDATE orders SET total_amount = $1 WHERE order_id = $2`,
            [total_amount, order_id]
        );

        await client.query('COMMIT');
        res.status(200).json({ message: 'Order placed successfully.', order_id });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error placing order:', err.message);
        res.status(500).json({ error: 'Failed to place order.' });
    } finally {
        client.release();
    }
});

// Process Payment
app.post('/process-payment', async (req, res) => {
    const { order_id, amount, payment_method, card_details_id, bank_account_id } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Insert into payment table
        await client.query(
            `INSERT INTO payment (order_id, amount, payment_method, card_details_id, bank_account_id) 
            VALUES ($1, $2, $3, $4, $5)`,
            [order_id, amount, payment_method, card_details_id || null, bank_account_id]
        );

        // Update bank_account balance
        await client.query(
            `UPDATE bank_account SET balance = balance - $1 WHERE bank_account_id = $2`,
            [amount, bank_account_id]
        );

        // Update company's account (assuming bank_account_id = 1)
        await client.query(
            `UPDATE bank_account SET balance = balance + $1 WHERE bank_account_id = 1`,
            [amount]
        );

        // Update order payment_status
        await client.query(
            `UPDATE orders SET payment_status = 'Paid' WHERE order_id = $1`,
            [order_id]
        );

        await client.query('COMMIT');
        res.status(200).json({ message: 'Payment processed successfully.' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error processing payment:', err.message);
        res.status(500).json({ error: 'Failed to process payment.' });
    } finally {
        client.release();
    }
});

// Add New Customer
app.post('/customers', async (req, res) => {
    const { first_name, last_name, email, phone, loyalty_card_number } = req.body;

    if (!first_name || !last_name || !email || !phone) {
        return res.status(400).json({ error: 'All fields except loyalty_card_number are required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO customer (first_name, last_name, email, phone, loyalty_card_number) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [first_name, last_name, email, phone, loyalty_card_number || null]
        );
        console.log('Customer added:', result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error adding customer:', err.message);
        if (err.message.includes('duplicate key value')) {
            res.status(409).json({ error: 'Duplicate email or loyalty card number' });
        } else {
            res.status(500).json({ error: 'Server error while adding customer' });
        }
    }
});

// Get all customers
app.get('/customers', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM customer');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching customers:', err.message);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for any unmatched routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
