
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const invoiceRouter = require('./routes/invoice');
const app = express();

// Set up EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files like CSS
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Database setup
const db = new sqlite3.Database('invoices.db', (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err);
    } else {
        console.log('Connected to SQLite database.');
        db.run(`
            CREATE TABLE IF NOT EXISTS invoices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_name TEXT,
                customer_email TEXT,
                invoice_date TEXT,
                service_details TEXT,
                quantity INTEGER,
                price REAL,
                total REAL
            )
        `);
    }
});

// Use the invoice router
app.use('/invoice', invoiceRouter);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
