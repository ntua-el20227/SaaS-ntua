const express = require('express');
const cors = require('cors');

/* Import routes */
const routes = require('./routes/credits_routes.js');

const app = express();
app.use(cors());
app.use('/credits-api', routes);

// Middleware to parse JSON and URL-encoded data
//app.use(express.json());
//app.use(express.urlencoded({ extended: true }));

// Use routes defined for microservice-solver


app.use((req, res, next) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

module.exports = app;