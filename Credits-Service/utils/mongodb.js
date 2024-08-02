require('dotenv').config();
const mongoose = require('mongoose');

const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MONGODB");
    } catch (error) {
        console.log("Error connecting to database: ", error);
    }
};

const disconnectMongoDB = async () => {
    try {
        await mongoose.disconnect();
        console.log("Disconnected from MONGODB");
    } catch (error) {
        console.log("Error disconnecting from database: ", error);
    }
};

module.exports = { connectMongoDB, disconnectMongoDB };