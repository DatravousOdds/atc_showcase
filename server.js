require('dotenv').config();
const nodemailer = require('nodemailer');
const express = require('express');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const { Pool } = require('pg');

// Database connection setup
const credentials = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
};


// Configure Cloudinary
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'atc_resumes',
        allowed_formats: ['pdf', 'doc', 'docx'],
        resource_type: 'raw',
        public_id: (req, file) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            return 'resume-' + uniqueSuffix;
        }
    }
});

const uploadResume = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit



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
    host: 'smtp.hostinger.com',
    port: 587,
    secure: false,
    auth: {
        user: 'datravousodds@americantraffictx.com',
        pass: 'Travis010799@'
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
            .header { background-color: #ff0d00; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background-color: #f9f9f9; }
            .quote-box { background: white; padding: 20px; border-left: 4px solid #ff0d00; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            .button { display: inline-block; padding: 12px 30px; background-color: #ff0d00; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
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
                
                <p>Questions? Call us at <strong>(682) 470-2126 </strong> or reply to this email.</p>
                
                <center>
                    <a href="http://americantraffictx.com/quote/${quoteId}" class="button">View Your Quote</a>
                </center>
            </div>
            <div class="footer">
                <p>© 2025 American Traffic Construction, LLC. All rights reserved.</p>
                <p>This is an automated message from our quote system.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// submit job application
app.post('/api/applications', uploadResume.single('resume'), async (req, res) => {
    try {
        const { firstName, lastName, email, phone, linkedInProfile, coverLetter, position, location, job_status, type } = req.body;

        const resumeFilePath = req.file.path ? req.file.path : null; // Cloudinary URL

        console.log("Received application:", { firstName, lastName, email, phone, linkedInProfile, resumeFilePath, coverLetter, position, location, type, job_status });
        // Save application data to the database
        const result = pool.query(
            `INSERT INTO website_applications 
            (first_name, last_name, email, phone_number, linkedin_url, resume_file_path, cover_letter, job_position, job_location, application_type, application_status) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
            [
                firstName, lastName, email, phone,
                linkedInProfile, resumeFilePath, coverLetter,
                position, location, type, job_status
            ]
        );

        console.log('Application saved with ID:', (await result).rows[0].id);

        // send email notification to admin
        const adminMailOptions = {
            from: `American Traffic Construction <${process.env.EMAIL_FROM}>`,
            to: process.env.ADMIN_EMAIL,
            subject: 'New Job Application Received',
            html: `
                <h2>New Job Application Received</h2>
                <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Position Applied For:</strong> ${position}</p>
                <p><strong>Location:</strong> ${location}</p>
                <p><strong>Application Type:</strong> ${type}</p>
                ${ resumeFilePath ? `<p><strong>Resume:</strong> <a href="${resumeFilePath}">View Resume</a></p>` : '<p><strong>Resume:</strong> Not provided</p>' }
            `
        };

        await transporter.sendMail(adminMailOptions);
        console.log('Notification email sent to ${process.env.ADMIN_EMAIL}');


        // send confirmation email to applicant
        const clientMailOptions = {
            from: `American Traffic Construction <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: 'Application Received - Thank You for Applying',
            html: `
                <h2>Thank You for Applying!</h2>
                <p>Dear ${firstName},</p>
                <p>We have received your application for the position of ${position} at our ${location} location. Our team will review your application and get back to you shortly.</p>
                <p>If you have any questions, feel free to reply to this email or call us at (682) 470-2126.</p>
                <p>Best regards,<br/>American Traffic Construction Team</p>
            `
        };

        await transporter.sendMail(clientMailOptions);
        console.log('Confirmation email sent to:', email);

        res.status(201).json({ message: 'Application submitted successfully' });

    } catch (err) {
        console.error('Error processing application', err.stack);
        return res.status(500).json({ error: 'Internal Server Error' });
    }

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

        const adminMailOptions = {
            from: `American Traffic Construction <${process.env.EMAIL_FROM}>`,
            to: process.env.ADMIN_EMAIL,
            subject: 'New Quote Request from website',
            html: `
                <h2>New Quote Request Received</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Project Details:</strong> ${projectDetails}</p>
                <p><strong>Reference ID:</strong> #${quoteId}</p>
            `
        };

        await transporter.sendMail(adminMailOptions);
        console.log('Notification email sent to ${process.env.ADMIN_EMAIL}');
        
        const clientMailOptions = {
            from: `American Traffic Construction <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: 'Quote Request Received - We\'ll Be in Touch',
            html: getEmailTemplate(name.split(' ')[0], quoteId, 'General Service', projectDetails)
        };

        await transporter.sendMail(clientMailOptions);
        console.log('Email sent to:', email);

        res.status(201).json({ message: 'Quote request submitted successfully', quoteId });


    } catch (err) {
        console.error('Error saving quote request', err.stack);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.use(express.static(path.join(__dirname, "public")));


// download endpoint for resumes
app.get('/downloads/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'SELECT resume_file_path FROM website_applications WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const filePath = result.rows[0].resume_file_path;

        if (!filePath) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        // Assuming the filePath is a URL from Cloudinary
        res.redirect(filePath);

    } catch (err) {
        console.error('Error processing download', err.stack);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

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