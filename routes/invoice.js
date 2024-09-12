const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('invoices.db');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Ensure invoices directory exists
const invoicesDir = path.join(__dirname, '../public/invoices');
if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
}

// Display the invoice form
router.get('/', (req, res) => {
    res.render('invoice_form');
});

// Handle form submission and PDF generation
router.post('/create', (req, res) => {
    const { customerName, customerEmail, invoiceDate, serviceDetails, quantity, price } = req.body;
    const total = (quantity * price).toFixed(2);

    // Save to database
    db.run(`
        INSERT INTO invoices (customer_name, customer_email, invoice_date, service_details, quantity, price, total)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [customerName, customerEmail, invoiceDate, serviceDetails, quantity, price, total], function(err) {
        if (err) {
            return console.error(err.message);
        }

        // Generate PDF invoice
        const doc = new PDFDocument();
        const filePath = path.join(invoicesDir, `invoice_${this.lastID}.pdf`);
        doc.pipe(fs.createWriteStream(filePath));

        doc.fontSize(18).text('Invoice', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Customer: ${customerName}`);
        doc.text(`Email: ${customerEmail}`);
        doc.text(`Date: ${invoiceDate}`);
        doc.moveDown();
        doc.text(`Service Details: ${serviceDetails}`);
        doc.text(`Quantity: ${quantity}`);
        doc.text(`Price per Unit: $${price}`);
        doc.text(`Total: $${total}`);
        doc.end();

        // Respond with the PDF file for download
        res.download(filePath);
    });
});

module.exports = router;
