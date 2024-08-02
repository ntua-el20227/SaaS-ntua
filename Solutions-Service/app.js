const express = require('express');
const cors = require('cors');


const app = express();
app.use(cors());

/* Import routes */
const routes = require('./routes/solution_routes');
app.use('/solutions-api', routes);

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
//app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

module.exports = app;