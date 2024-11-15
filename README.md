NehAlifs BBQ Management Dashboard

Welcome to the NehAlifs BBQ Management Dashboard repository! This web application is designed to help manage and monitor various aspects of NehAlifs BBQ restaurants. The dashboard provides features like viewing daily revenue reports, tracking top-selling menu items, monitoring customer spending, and performing essential CRUD operations.

Daily Revenue Reports: View revenue generated each day across all restaurants.
Top Menu Items: Identify the most popular menu items based on sales.
Top Customers: Track customers who spend the most at the restaurants.
Customer Management: Add new customers and manage existing ones.
Order Processing: Place orders and process payments with transactional integrity.
Data Visualization: Interactive tables and reports for easy data interpretation.
Responsive Design: User-friendly interface accessible on various devices.
Tech Stack

Steps for Setup
Change the local database connection in the 'server.js' file. Current setup is user: 'postgres', host: 'localhost', database: '...', password: '...', port: 5432, Change any values if needed to match your local database.
All tables being used in local database are located in the 'create_tables.sql' file and ‘populate_tables.sql’ file. You should be able to copy and paste the entire files into postgres query tool and execute to generate the required database. If you can't do the entire .sql file at once, then generate each table one at a time.
Install the external 'node.js' at https://nodejs.org/en, click on the download tab and then prebuilt installer, select the correct download for your local system.
Once node.js is installed, you will need to run several npm commands in your terminal. npm install express https://expressjs.com/ npm install cors https://www.npmjs.com/package/cors npm install path https://www.npmjs.com/package/path npm install pg https://www.npmjs.com/package/pg
To run the server, type in the terminal node server.js

Frontend:
HTML5
CSS3
JavaScript (ES6)
Backend:
Node.js
Express.js
Database:
PostgreSQL
Dependencies:
body-parser
cors
express
pg
Prerequisites

Before you begin, ensure you have met the following requirements:

Node.js (version 14 or higher)
npm (version 6 or higher)
PostgreSQL (version 12 or higher)
Git (for cloning the repository)
Installation

Clone the Repository:
git clone https://github.com/alifyah-m/nehAlifs-bbq-dashboard.git
cd nehAlifs-bbq-dashboard
Install Node.js Dependencies:
npm install
Install PostgreSQL:
Download and install PostgreSQL from the official website if you haven't already.
Database Setup

Create the Database and User:
Open a terminal and run:

psql -U postgres
In the psql prompt, execute the following commands:

CREATE DATABASE restaurant;
CREATE USER postgres WITH PASSWORD '2201';
GRANT ALL PRIVILEGES ON DATABASE restaurant TO postgres;
\q
Execute SQL Scripts:
Create Tables:
psql -U postgres -d restaurant -f create_tables.sql
Populate Tables:
psql -U postgres -d restaurant -f populate_tables.sql
Ensure there are no errors during script execution. The scripts will set up the necessary tables and insert initial data.
Verify Database Connection:
Test the connection using psql:
psql -U postgres -d restaurant
Run a test query:
SELECT * FROM customer;
You should see the list of customers populated by the populate_tables.sql script.
Running the Application

Start the server by running:

npm start
The server should output:

Server running on http://localhost:3000
Usage

Access the Dashboard:
Open your web browser and navigate to http://localhost:3000.
Features:
Add New Customer:
Fill out the "Add New Customer" form with the customer's details.
Click the Add Customer button.
A success message will confirm the customer was added.
Process Payment:
Use the "Process Payment" form to process payments for orders.
Ensure you have the correct order_id and bank_account_id.
Click the Process Payment button.
The application will handle the transaction and update relevant tables.
Fetch All Data:
Click the Fetch All Data button to load data into all tables displayed on the dashboard.
View Reports:
Daily Revenue Report: Click the button to view revenue per day.
Top Menu Items: Click the button to see the most popular menu items.
Top Customers by Spending: Click the button to view top-spending customers.
Data Integrity:
All payment processing is done within a transaction to maintain data integrity.
Error handling ensures that any issues during transactions result in a rollback, preventing partial updates.
Forms and Event Handling:
Forms:
Ensure all required fields are filled before submission.
The forms use AJAX to communicate with the server without reloading the page.
Event Handling:
JavaScript event listeners handle form submissions and button clicks.
Project Structure

nehAlifs-bbq-dashboard/
├── create_tables.sql       # SQL script to create database tables
├── populate_tables.sql     # SQL script to populate tables with initial data
├── server.js               # Express.js server file
├── package.json            # Node.js dependencies and scripts
├── public/
│   ├── index.html          # Main HTML file
│   ├── styles.css          # CSS styles (if any)
│   └── scripts.js          # JavaScript functions (if separated)
└── README.md               # Project documentation
Scripts and Queries

SQL Scripts:
create_tables.sql: Defines the database schema, tables, constraints, and indexes.
populate_tables.sql: Inserts initial data into the tables for testing.
Server Routes (server.js):
GET /daily-revenue: Retrieves daily revenue data.
GET /top-menu-items: Retrieves top-selling menu items.
GET /top-customers: Retrieves top customers by spending.
POST /customers: Adds a new customer.
POST /process-payment: Processes a payment transaction.
GET /all-data: Retrieves all data for display.
Static Files: Serves static files from the public directory.
Frontend Functions (index.html or scripts.js):
Event listeners for form submissions.
Functions to fetch and display data from the server.
Dynamic table population for reports and data sections.
Troubleshooting

Server Not Starting:
Ensure PostgreSQL is running.
Check that you have installed all dependencies with npm install.
Verify the database connection details in server.js.
Database Errors:
Ensure that the create_tables.sql and populate_tables.sql scripts ran without errors.
Check that the PostgreSQL user has the necessary permissions.
Data Not Displaying:
Open the browser console to check for JavaScript errors.
Ensure the server is running and responding to requests.
Verify the API endpoints by testing them directly (e.g., using Postman or cURL).
Transaction Failures:
Check the server logs for detailed error messages.
Ensure that all foreign key references are valid.
Verify that sufficient funds are available in the bank_account for processing payments.
Contributing

Contributions are welcome! Please follow these steps:

Fork the Repository:
Click on the 'Fork' button at the top right corner of the repository page.
Clone Your Fork:
git clone https://github.com/alifyah-m/nehAlifs-bbq-dashboard.git
cd nehAlifs-bbq-dashboard
Create a Feature Branch:
git checkout -b feature/YourFeatureName
Make Your Changes:
Ensure your code follows the project's coding standards.
Update documentation if necessary.
Commit Your Changes:
git commit -am 'Add new feature'
Push to Your Fork:
git push origin feature/YourFeatureName
Create a Pull Request:
Submit a pull request to the main repository with a detailed description of your changes.
License

This project is licensed under the MIT License. See the LICENSE file for details.

Acknowledgements

Express.js: Fast, unopinionated, minimalist web framework for Node.js.
PostgreSQL: Open-source relational database.
Node.js: JavaScript runtime built on Chrome's V8 JavaScript engine.
