// user-management/models/user_routes.js
const mongoose = require('mongoose');

const creditsSchema = new mongoose.Schema({
    sub: {
        type: String,
        required: true,
    },
    creditValue: {
        type: Number,
        required: true,
    },
    creditSum:{
        type: Number,
        required: true,
    },
    receivedAt: {
        type: String,
        default: () => {
            // Create a new date
            const date = new Date();

            // Convert it to UTC+3
            return date.toLocaleString('en-US', {timeZone: 'Europe/Minsk'});
        }
    }
});

const Credits = mongoose.model("Credits", creditsSchema);
module.exports = Credits;