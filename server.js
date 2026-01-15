const nodemailer = require('nodemailer');
const express = require('express');
const path = require('path');
const app = express();
const { Pool } = require('pg');

// Database connection setup
const credentials = {
    user: 'postgres',
    host: 'localhost',
    database: 'atc_contracts',
    password: 'password',
    port: 5432, 
};

// Create a new pool instance
const pool = new Pool(credentials);

// Test the database connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Database connected successfully');
    release();

});



const PORT = 3000;


app.use(express.static(path.join(__dirname, "public")));

// home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"))
})

// project page
app.get('/projects', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "pages","projects.html"))
})



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});