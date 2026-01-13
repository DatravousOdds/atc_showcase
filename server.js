const nodemailer = require('nodemailer');
const express = require('express');
const app = express();
const PORT = 3000;

// home page
app.get('/', (req, res) => {

})

// project page
app.get('/projects', (req, res) => {
    
})



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});