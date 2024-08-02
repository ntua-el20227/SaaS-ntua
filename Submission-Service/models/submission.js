const mongoose = require('mongoose');

// Define the solution schema
const submissionSchema = new mongoose.Schema({
    ProblemId: {
        type: String,
        required: true
    },
    metadata: {
        v_number: {
            type: String,
            required: true
        },
        depot: {
            type: String,
            required: true
        },
        max_dist: {
            type: Number,
            required: true
        },
        sub: {
            type: String,
            required: true
        },
        solver_name: {
            type: String,
            required: true
        }
    },
    fileContent: {
        type: JSON,
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

// Create the Solutions model
const Submission = mongoose.model("Submission", submissionSchema);

module.exports = Submission;