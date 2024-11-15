// server.js

const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Database connection configuration
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'restaurant',
    password: '2201',
    port: 5432,
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to fetch data from a query
async function fetchData(query, params = []) {
    try {
        const result = await pool.query(query, params);
        return result.rows;
    } catch (err) {
        console.error('Error executing query:', err.message);
        return null;
    }
}

// ======================
// API Endpoints
// ======================

// Fetch menu items
app.get('/menu', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM menu_item');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching menu items:', err.message);
        res.status(500).json({ error: 'Failed to fetch menu items' });
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
            `SELECT SUM(quantity * price) AS total_amount FROM order_item WHERE order_id = $1`,
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
        const paymentResult = await client.query(
            `INSERT INTO payment (order_id, amount, payment_method, card_details_id, bank_account_id) 
            VALUES ($1, $2, $3, $4, $5) RETURNING *`,
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
    try {
        const result = await pool.query(
            'INSERT INTO customer (first_name, last_name, email, phone, loyalty_card_number) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [first_name, last_name, email, phone, loyalty_card_number || null]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error adding customer:', err.message);
        res.status(500).json({ error: 'Server error while adding customer' });
    }
});

// Get All Data
app.get('/all-data', async (req, res) => {
    try {
        const orders = await fetchData('SELECT * FROM orders');
        const customers = await fetchData('SELECT * FROM customer');
        const menuItems = await fetchData('SELECT * FROM menu_item');
        const bankAccounts = await fetchData('SELECT * FROM bank_account');
        const payments = await fetchData('SELECT * FROM payment');
        const employees = await fetchData('SELECT * FROM employee');
        const receipts = await fetchData('SELECT * FROM receipt');

        const allData = {
            orders,
            customers,
            menuItems,
            bankAccounts,
            payments,
            employees,
            receipts,
        };

        res.status(200).json(allData);
    } catch (err) {
        console.error('Error fetching all data:', err.message);
        res.status(500).json({ error: 'Failed to fetch all data' });
    }
});

// Daily Revenue Report
app.get('/daily-revenue', async (req, res) => {
    const query = `
        SELECT 
            DATE(order_date) AS order_date, 
            SUM(total_amount)::float AS daily_revenue
        FROM 
            orders
        GROUP BY 
            DATE(order_date)
        ORDER BY 
            DATE(order_date) DESC;
    `;
    const result = await fetchData(query);
    if (result) {
        res.status(200).json(result);
    } else {
        res.status(500).json({ error: 'Error fetching daily revenue report.' });
    }
});

// Top Menu Items
app.get('/top-menu-items', async (req, res) => {
    const query = `
        SELECT 
            mi.name, 
            SUM(oi.quantity) AS total_quantity_sold
        FROM 
            order_item oi
        JOIN 
            menu_item mi ON oi.menu_item_id = mi.menu_item_id
        GROUP BY 
            mi.name
        ORDER BY 
            total_quantity_sold DESC
        LIMIT 5;
    `;
    const result = await fetchData(query);
    if (result) {
        res.status(200).json(result);
    } else {
        res.status(500).json({ error: 'Error fetching top menu items.' });
    }
});

// Top Customers by Spending
app.get('/top-customers', async (req, res) => {
    const query = `
        SELECT 
            c.first_name || ' ' || c.last_name AS customer_name,
            SUM(o.total_amount)::float AS total_spent
        FROM 
            orders o
        JOIN 
            customer c ON o.customer_id = c.customer_id
        GROUP BY 
            c.customer_id, customer_name
        ORDER BY 
            total_spent DESC
        LIMIT 5;
    `;
    const result = await fetchData(query);
    if (result) {
        res.status(200).json(result);
    } else {
        res.status(500).json({ error: 'Error fetching top customers.' });
    }
});

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
