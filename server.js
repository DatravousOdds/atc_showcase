require('dotenv').config();

const nodemailer = require('nodemailer');
const express = require('express');
const multer = require('multer');
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


const transporter = nodemailer.createTransport({
    service: 'outlook',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


const getEmailTemplate = (firstName, quoteId, serviceType, projectDescription) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background-color: #f9f9f9; }
            .quote-box { background: white; padding: 20px; border-left: 4px solid #007bff; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            .button { display: inline-block; padding: 12px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Quote Request Received!</h1>
            </div>
            <div class="content">
                <h2>Hi ${firstName},</h2>
                <p>Thank you for requesting a quote! We've received your information and our team is reviewing it.</p>
                
                <div class="quote-box">
                    <h3>Your Quote Details:</h3>
                    <p><strong>Reference Number:</strong> #${quoteId}</p>
                    <p><strong>Service Type:</strong> ${serviceType}</p>
                    <p><strong>Project Description:</strong> ${projectDescription}</p>
                </div>
                
                <p><strong>What happens next?</strong></p>
                <ul>
                    <li>Our team will review your request within 24 hours</li>
                    <li>We'll prepare a detailed quote based on your requirements</li>
                    <li>You'll receive a follow-up email with pricing and next steps</li>
                </ul>
                
                <p>Questions? Call us at <strong>(123) 456-7890</strong> or reply to this email.</p>
                
                <center>
                    <a href="http://yourwebsite.com/quote/${quoteId}" class="button">View Your Quote</a>
                </center>
            </div>
            <div class="footer">
                <p>© 2025 Your Company Name. All rights reserved.</p>
                <p>This is an automated message from our quote system.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/resumes/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /pdf|doc|docx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only PDF and Word documents are allowed!'));
        }
    }
});

app.post('/api/uploadResume', upload.single('resume'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
        filePath: req.file.path,
        fileName: req.file.filename
    })
ç
});

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
            linkedInProfile, resume, coverLetter,
            position, location, job_status, type
        } = req.body;

        // Here you would typically save the application data to your database
        console.log("Received application:", req.body);

        try {
            const insertQuery = `INSERT INTO website_applications 
                (first_name, last_name, email, phone_number, linkedin_url, resume_file_path, cover_letter, job_position, job_location, application_type, application_status) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`;

            const values = [
                                firstName, lastName, email, phone_number, 
                                linkedInProfile, resume, coverLetter,
                                position, location, type, job_status
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
app.post('/api/quote', express.json(), async (req, res) => {
    const { name, email, phone, projectDetails } = req.body;

    console.log("Received quote request:", req.body);

    try {
        const insertQuery = `INSERT INTO website_quotes (full_name, email, phone, project_detail) VALUES ($1, $2, $3, $4) RETURNING id`;
        const values = [name, email, phone, projectDetails];

        const result = await pool.query(insertQuery, values);
        const quoteId = result.rows[0].id;

        console.log('Quote request saved with ID:', quoteId);
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Quote Request Received - We\'ll Be in Touch',
            html: getEmailTemplate(name.split(' ')[0], quoteId, 'General Service', projectDetails)
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent to:', email);

        res.status(201).json({ message: 'Quote request submitted successfully', quoteId });


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