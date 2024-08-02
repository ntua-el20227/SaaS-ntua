// user-management/server.js
const express = require('express');
const dotenv = require('dotenv'); // Import dotenv library
const userRoutes = require('./routes/user_routes');
const cors = require('cors'); // Import the cors package

// Load environment variables from .env file
dotenv.config();

const {  PORT } = process.env; // Access environment variables

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));

// Routes
app.use('/userManagement-api', userRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
