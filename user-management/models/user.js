// user-management/models/user_routes.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        sub: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            default: 'user'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },

    { timestamps: false }
);

const User =  mongoose.model("User", userSchema);
module.exports = User;