const mongoose = require('mongoose');
const moment = require('moment-timezone');

// Define the solution schema
const solutionSchema = new mongoose.Schema({
    sub: {
        type: String,
        required: true
    },
    ProblemId: {
        type: String,
        required: true
    },
    Duration: {
        type: Number,
        required: true
    },
    CreditValue: {
        type: Number,
        required: true
    },
    Objective: {
        type: Number,
        required: true
    },
    Routes: [
        {
            vehicle: {
                type: Number,
                required: true
            },
            route: {
                type: [Number], // Array of integers representing the route
                required: true
            },
            distance: {
                type: Number,
                required: true
            }
        }
    ],
    max_route_distance: {
        type: Number,
        required: true
    },
    receivedAt: {
        type: String,
        default: () => {
            const greeceTime = moment().tz('Europe/Athens').format('YYYY-MM-DD HH:mm:ss');
            return greeceTime;
        }
    }
});

// Create the Solution model
const Solution = mongoose.model("Solution", solutionSchema);

module.exports = Solution;
