const nodemailer = require('nodemailer');
const express = require('express');
const path = require('path');
const app = express();
const { Pool } = require('pg');

// Database connection setup
const credentials = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'atc_contracts',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
};



// Create a new pool instance
const pool = new Pool(credentials);

// Test the database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to the database', err.stack);
    } else {
        console.log('Database connected successfully at:', res.rows[0].now);
    }   
});


const PORT = 3000;


// get all projects or filter by type
app.get('/api/projects', async (req, res) => {
    console.log("Received request for projects");
    try {
        const { type } = req.query;
        let query = 'SELECT project_title, project_description, project_type, project_material, project_image_path, project_location, project_date FROM website_projects';
        let parameters = [];

        if (type) {
            query += ' WHERE project_type ILIKE $1';
            parameters.push(type);
        }

        const result = await pool.query(query, parameters);
        console.log("projects data:", result.rows);
        res.json(result.rows);
        
    } catch (err) {
        console.error('Error fetching projects', err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// submit general application form
app.post('/api/apply', express.json(), (req, res) => { 
        const {
            firstName, lastName, email, phone_number,
            linkedin_url, resume_file_path, cover_letter,
            job_position, job_location, job_status, app_application_type
        } = req.body;

        // Here you would typically save the application data to your database
        console.log("Received application:", req.body);

        try {
            const insertQuery = `INSERT INTO website_applications 
                (first_name, last_name, email, phone_number, linkedin_url, resume_file_path, cover_letter, job_position, job_location, application_type, application_status) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`;

            const values = [
                                firstName, lastName, email, phone_number, 
                                linkedin_url, resume_file_path, cover_letter,
                                job_position, job_location, app_application_type, job_status
                            ];

            pool.query(insertQuery, values, (err, result) => {
                if (err) {
                    console.error('Error saving application', err.stack);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                const applicationId = result.rows[0].id;
                console.log('Application saved with ID:', applicationId);
                res.status(201).json({ message: 'Application submitted successfully', applicationId });
            });

        } catch (err) {
            console.error('Error saving application', err.stack);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
});

// submit quote form
app.post('/api/quote', express.json(), (req, res) => {
    const { name, email, phone, projectDetails } = req.body;

    console.log("Received quote request:", req.body);

    try {
        const insertQuery = `INSERT INTO website_quotes (full_name, email, phone, project_detail) VALUES ($1, $2, $3, $4) RETURNING id`;
        const values = [name, email, phone, projectDetails];

        pool.query(insertQuery, values, (err, result) => {
            if (err) {
                console.error('Error saving quote request', err.stack);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            const quoteId = result.rows[0].id;
            console.log('Quote request saved with ID:', quoteId);
            res.status(201).json({ message: 'Quote request submitted successfully', quoteId });
        });

    } catch (err) {
        console.error('Error saving quote request', err.stack);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


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