// script.js

// Variables to store data
let currentMenuItems = [];
let currentOrder = {
    customer_id: null,
    restaurant_id: null,
    items: [] // Each item: { menu_item_id, quantity, price }
};

// =========================
// Fetch and Display Functions
// =========================


async function fetchMenuItems() {
    try {
      const response = await fetch('/menu');
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      currentMenuItems = await response.json();
      if (currentMenuItems.length === 0) {
        alert('No menu items available.');
        return;
      }
      displayMenu(currentMenuItems);
      populateTable('menuItemsTable', currentMenuItems, ['menu_item_id', 'name', 'price', 'category']);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      alert('Error fetching menu items. Please try again later.');
    }
  }
  
  
  // Function to display menu items on the page
function displayMenu(menuItems) {
    const menuDiv = document.getElementById('menu-items');
    menuDiv.innerHTML = '';
    menuItems.forEach(item => {
        const price = parseFloat(item.price) || 0; // Ensure price is a number
        const itemDiv = document.createElement('div');
        itemDiv.className = 'menu-item';
        itemDiv.innerHTML = `
            <h3>${item.name} - $${price.toFixed(2)}</h3>
            <p>${item.description}</p>
            <label>Quantity: <input type="number" min="1" value="1" id="quantity-${item.menu_item_id}"></label>
            <button onclick="addToOrder(${item.menu_item_id})">Add to Order</button>
        `;
        menuDiv.appendChild(itemDiv);
    });
}

// Fetch and display orders
async function fetchOrders() {
    try {
        const response = await fetch('/orders');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const orders = await response.json();
        populateTable('ordersTable', orders, ['order_id', 'customer_id', 'total_amount', 'order_date']);
    } catch (error) {
        console.error('Error fetching orders:', error);
        alert('Error fetching orders');
    }
}

// Fetch and display payments
async function fetchPayments() {
    try {
        const response = await fetch('/payments');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const payments = await response.json();
        populateTable('paymentsTable', payments, ['payment_id', 'payment_date', 'amount', 'payment_method', 'bank_account_id', 'card_details_id']);
    } catch (error) {
        console.error('Error fetching payments:', error);
        alert('Error fetching payments');
    }
}

// Fetch and display bank accounts
async function fetchBankAccounts() {
    try {
        const response = await fetch('/bank-accounts');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const bankAccounts = await response.json();
        populateTable('bankAccountsTable', bankAccounts, ['bank_account_id', 'account_number', 'account_holder_name', 'balance']);
    } catch (error) {
        console.error('Error fetching bank accounts:', error);
        alert('Error fetching bank accounts');
    }
}

// Fetch and display customers
async function fetchCustomers() {
    try {
        const response = await fetch('/customers');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const customers = await response.json();
        populateTable('customersTable', customers, ['customer_id', 'first_name', 'last_name', 'email', 'phone']);
    } catch (error) {
        console.error('Error fetching customers:', error);
        alert('Error fetching customers');
    }
}

// Fetch and display data for browsing
async function browseData(tableName) {
    try {
        const response = await fetch(`/browse/${tableName}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        const tableColumns = {
            customers: ['customer_id', 'first_name', 'last_name', 'email', 'phone'],
            orders: ['order_id', 'customer_id', 'total_amount', 'order_date'],
            payments: ['payment_id', 'payment_date', 'amount', 'payment_method', 'bank_account_id', 'card_details_id'],
            'bank-accounts': ['bank_account_id', 'account_number', 'account_holder_name', 'balance'],
            'menu-items': ['menu_item_id', 'name', 'price', 'category']
        };
        const tableId = tableName.replace('-', '') + 'Table';
        populateTable(tableId, data, tableColumns[tableName]);
    } catch (error) {
        console.error(`Error browsing data from ${tableName}:`, error);
        alert(`Error browsing data from ${tableName}`);
    }
}

// General function to populate tables
function populateTable(tableId, rows, columns) {
    const tableBody = document.getElementById(tableId);
    if (!tableBody) return;
    if (rows.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="' + columns.length + '">No data available</td></tr>';
        return;
    }
    tableBody.innerHTML = rows.map(row =>
        `<tr>${columns.map(col => `<td>${row[col] !== null ? row[col] : 'N/A'}</td>`).join('')}</tr>`
    ).join('');
}

// =========================
// Event Listeners for Forms
// =========================

// Event listener for adding a new customer
document.getElementById('add-customer-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    try {
        const response = await fetch('/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (response.ok) {
            alert(`Customer added with ID: ${result.customer_id}`);
            fetchCustomers(); // Fetch updated customer list
        } else {
            alert(`Error: ${result.error}`);
        }
    } catch (error) {
        console.error('Error adding customer:', error);
        alert('Error adding customer.');
    }
});

// Event listener for adding a new bank account
document.getElementById('add-bank-account-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.balance = parseFloat(data.balance);
    try {
        const response = await fetch('/bank-accounts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (response.ok) {
            alert(`Bank account added with ID: ${result.bank_account_id}`);
            fetchBankAccounts();
        } else {
            alert(`Error: ${result.error}`);
        }
    } catch (error) {
        console.error('Error adding bank account:', error);
        alert('Error adding bank account.');
    }
});

// Event listener for adding a new payment
document.getElementById('process-payment-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.amount = parseFloat(data.amount);
    try {
        const response = await fetch('/process-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            fetchPayments();
            fetchBankAccounts(); // Update bank account balances
        } else {
            alert(`Error: ${result.error}`);
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        alert('Error processing payment.');
    }
});

// Event listener for adding a new menu item
document.getElementById('add-menu-item-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.price = parseFloat(data.price);
    try {
        const response = await fetch('/menu-items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (response.ok) {
            alert(`Menu item added with ID: ${result.menu_item_id}`);
            fetchMenuItems();
        } else {
            alert(`Error: ${result.error}`);
        }
    } catch (error) {
        console.error('Error adding menu item:', error);
        alert('Error adding menu item.');
    }
});

// =========================
// GUI Buttons Event Listeners
// =========================

// Create Tables Button
document.getElementById('create-tables-btn').addEventListener('click', async function() {
    if (confirm('This will create all tables. Do you want to proceed?')) {
        try {
            const response = await fetch('/create-tables', { method: 'POST' });
            const result = await response.json();
            if (response.ok) {
                alert(result.message);
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Error creating tables:', error);
            alert('Error creating tables.');
        }
    }
});

// Initialize Database Button
document.getElementById('initialize-db-btn').addEventListener('click', async function() {
    if (confirm('This will initialize the database with default data. Do you want to proceed?')) {
        try {
            const response = await fetch('/initialize-db', { method: 'POST' });
            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                // Fetch updated data
                fetchMenuItems();
                fetchCustomers();
                fetchBankAccounts();
                fetchPayments();
                fetchOrders();
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Error initializing database:', error);
            alert('Error initializing database.');
        }
    }
});

// Delete All Rows Button
document.getElementById('delete-rows-btn').addEventListener('click', async function() {
    const tableName = prompt('Enter the table name from which you want to delete all rows:');
    if (tableName) {
        if (confirm(`Are you sure you want to delete all rows from ${tableName}? This action cannot be undone.`)) {
            try {
                const response = await fetch(`/delete-rows/${tableName}`, { method: 'DELETE' });
                const result = await response.json();
                if (response.ok) {
                    alert(result.message);
                    // Fetch updated data
                    if (tableName === 'customers') fetchCustomers();
                    else if (tableName === 'menu_item') fetchMenuItems();
                    else if (tableName === 'bank_account') fetchBankAccounts();
                    else if (tableName === 'payment') fetchPayments();
                    else if (tableName === 'orders') fetchOrders();
                } else {
                    alert(`Error: ${result.error}`);
                }
            } catch (error) {
                console.error(`Error deleting rows from ${tableName}:`, error);
                alert(`Error deleting rows from ${tableName}.`);
            }
        }
    }
});

// Browse Data Button
document.getElementById('browse-data-btn').addEventListener('click', function() {
    const tableName = prompt('Enter the table name you want to browse (e.g., customers, orders, payments, bank-accounts, menu-items):');
    if (tableName) {
        browseData(tableName);
    }
});

// =========================
// Initialize the Page
// =========================

window.onload = function () {
    fetchMenuItems();
    fetchCustomers();
    fetchBankAccounts();
    fetchPayments();
    fetchOrders();
};

