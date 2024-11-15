// script.js

// Event listener for adding a new customer
document.getElementById('add-customer-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    try {
        const response = await fetch('/customers', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (response.ok) {
            alert(`Customer added with ID: ${result.customer_id}`);
        } else {
            alert(`Error: ${result.error}`);
        }
    } catch (error) {
        console.error('Error adding customer:', error);
        alert('Error adding customer.');
    }
});

// Event listener for processing payment
document.getElementById('process-payment-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    try {
        const response = await fetch('/process-payment', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (response.ok) {
            alert(result.message);
        } else {
            alert(`Error: ${result.error}`);
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        alert('Error processing payment.');
    }
});

// Fetch functions for reports
async function fetchDailyRevenue() {
    await fetchData('/daily-revenue', 'dailyRevenueTable', ['order_date', 'daily_revenue']);
}

async function fetchTopMenuItems() {
    await fetchData('/top-menu-items', 'topMenuItemsTable', ['name', 'total_quantity_sold']);
}

async function fetchTopCustomers() {
    await fetchData('/top-customers', 'topCustomersTable', ['customer_name', 'total_spent']);
}

// General fetch function to populate tables
async function fetchData(url, tableId, columns) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        populateTable(tableId, data, columns);
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        alert(`Error fetching data from ${url}`);
    }
}

function populateTable(tableId, rows, columns) {
    const tableBody = document.getElementById(tableId);
    tableBody.innerHTML = rows.map(row => 
        `<tr>${columns.map(col => `<td>${row[col] !== null ? row[col] : 'N/A'}</td>`).join('')}</tr>`).join('');
}

function populateTables(data) {
    if (data.orders) {
        populateTable('ordersTable', data.orders, ['order_id', 'customer_id', 'total_amount', 'order_date']);
    }
    if (data.customers) {
        populateTable('customersTable', data.customers, ['customer_id', 'first_name', 'last_name', 'email', 'phone']);
    }
    if (data.menuItems) {
        populateTable('menuItemsTable', data.menuItems, ['menu_item_id', 'name', 'price', 'category']);
    }
    if (data.employees) {
        populateTable('employeesTable', data.employees, ['employee_id', 'first_name', 'last_name', 'role']);
    }
    if (data.receipts) {
        populateTable('receiptsTable', data.receipts, ['receipt_id', 'order_id', 'receipt_date']);
    }
    if (data.payments) {
        populateTable('paymentsTable', data.payments, ['payment_id', 'payment_date', 'amount', 'payment_method', 'bank_account_id', 'card_details_id']);
    }
    if (data.bankAccounts) {
        populateTable('bankAccountsTable', data.bankAccounts, ['bank_account_id', 'account_number', 'account_holder_name', 'balance']);
    }
}

// Function to fetch all data
async function fetchAllData() {
    try {
        const response = await fetch('/all-data');
        const data = await response.json();
        populateTables(data);
    } catch (error) {
        console.error('Error loading all data:', error);
        alert('Error loading all data');
    }
}

// Variables to store menu items and current order
let currentMenuItems = [];
let currentOrder = {
    customer_id: null,
    restaurant_id: null,
    items: [] // Each item: { menu_item_id, quantity, price }
};

// Fetch and display the menu
async function fetchMenuItems() {
    try {
        const response = await fetch('/menu');
        currentMenuItems = await response.json();
        displayMenu(currentMenuItems);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        alert('Error fetching menu items');
    }
}

function displayMenu(menuItems) {
    const menuDiv = document.getElementById('menu-items');
    menuDiv.innerHTML = '';
    menuItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'menu-item';
        itemDiv.innerHTML = `
            <h3>${item.name} - $${item.price.toFixed(2)}</h3>
            <p>${item.description}</p>
            <label>Quantity: <input type="number" min="1" value="1" id="quantity-${item.menu_item_id}"></label>
            <button onclick="addToOrder(${item.menu_item_id})">Add to Order</button>
        `;
        menuDiv.appendChild(itemDiv);
    });
}

// Add item to the current order
function addToOrder(menu_item_id) {
    const quantityInput = document.getElementById(`quantity-${menu_item_id}`);
    const quantity = parseInt(quantityInput.value);
    if (quantity > 0) {
        // Get menu item details
        const menuItem = currentMenuItems.find(item => item.menu_item_id === menu_item_id);
        if (menuItem) {
            currentOrder.items.push({
                menu_item_id: menu_item_id,
                quantity: quantity,
                price: menuItem.price
            });
            alert(`${menuItem.name} added to order.`);
            updateOrderSummary();
        } else {
            alert('Menu item not found.');
        }
    } else {
        alert('Please enter a valid quantity.');
    }
}

// Update order summary display
function updateOrderSummary() {
    const orderSummaryDiv = document.getElementById('order-summary');
    orderSummaryDiv.innerHTML = '';
    let totalAmount = 0;
    currentOrder.items.forEach(item => {
        const menuItem = currentMenuItems.find(mi => mi.menu_item_id === item.menu_item_id);
        const itemTotal = item.quantity * item.price;
        totalAmount += itemTotal;
        orderSummaryDiv.innerHTML += `<p>${menuItem.name} x${item.quantity} - $${itemTotal.toFixed(2)}</p>`;
    });
    orderSummaryDiv.innerHTML += `<p><strong>Total: $${totalAmount.toFixed(2)}</strong></p>`;
}

// Event listener for placing an order
document.getElementById('place-order-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (currentOrder.items.length === 0) {
        alert('Please add items to your order.');
        return;
    }
    const formData = new FormData(e.target);
    currentOrder.customer_id = parseInt(formData.get('customer_id'));
    currentOrder.restaurant_id = parseInt(formData.get('restaurant_id'));
    try {
        const response = await fetch('/place-order', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(currentOrder)
        });
        const result = await response.json();
        if (response.ok) {
            alert(`Order placed successfully. Order ID: ${result.order_id}`);
            // Reset order
            currentOrder.items = [];
            updateOrderSummary();
            // Reset form fields
            e.target.reset();
        } else {
            alert(`Error: ${result.error}`);
        }
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Error placing order.');
    }
});

// Initialize the page
window.onload = function() {
    fetchAllData();
    fetchMenuItems();
};
