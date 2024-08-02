const User = require("../models/user");
const {connectMongoDB, disconnectMongoDB} = require("../utils/mongodb");
require('dotenv').config();

exports.checkUser = async (req, res) => {
    const { name, email } = req.body;
    console.log("Name: ", name);
    console.log("Email: ", email);

    try {
        // Connect to MongoDB
        await connectMongoDB();

        // Check if user already exists
        console.log("Sub: ", req.user.sub);
        let user = await User.findOne({ sub: req.user.sub });
        if (!user) {
            // Create new user if not exists
            const current_time = new Date().toISOString();
            user = new User({ sub: req.user.sub, email: email, name: name, createdAt: current_time});
            await user.save();

            res.status(200).json({ message: 'User created successfully' });
        }
        else{
            res.status(200).json({ message: 'User already exists' });
        }
    } catch (error) {
        console.error('Error during User Verification', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    finally {
        // Disconnect from the database
        await disconnectMongoDB();
        console.log("Disconnected from MongoDB");
    }
}

exports.userDetails = async (req, res) => {
    try {
        // Connect to MongoDB
        await connectMongoDB();

        // Get all users from the database
        const user = await User.find({ sub: req.user.sub });
        res.status(200).json(user);
    } catch (error) {
        console.error('Error retrieving users', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    finally {
        // Disconnect from the database
        await disconnectMongoDB();
        console.log("Disconnected from MongoDB");
    }
}

exports.allUsers = async (req, res) => {
    try {
        // Connect to MongoDB
        await connectMongoDB();

        // Get all users from the database
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error retrieving users', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    finally {
        // Disconnect from the database
        await disconnectMongoDB();
        console.log("Disconnected from MongoDB");
    }
}

exports.changeName = async (req, res) => {
    try {
        // Connect to MongoDB
        await connectMongoDB();

        // Find the user by sub
        const user = await User.findOne({ sub: req.user.sub });

        if (!user) {
            res.status(200).json({ message: 'User not found' });
        } else {
            // Update the user's name
            user.name = req.params.NewName;
            await user.save();
            res.status(200).json({ message: 'Name updated successfully' });
        }
    } catch (error) {
        console.error('Error updating name', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    finally {
        // Disconnect from the database
        await disconnectMongoDB();
        console.log("Disconnected from MongoDB");
    }

}

exports.AdminChangeName = async (req, res) => {
    try {
        // Connect to MongoDB
        await connectMongoDB();

        // Find the user by sub
        const user = await User.findOne({ sub: req.body.sub });
        console.log("sub: ", req.body.sub)

        if (!user) {
            res.status(200).json({ message: 'User not found' });
        } else {
            // Update the user's name
            user.name = req.params.NewName;
            await user.save();
            res.status(200).json({ message: 'Name updated successfully' });
        }
    } catch (error) {
        console.error('Error updating name', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    finally {
        // Disconnect from the database
        await disconnectMongoDB();
        console.log("Disconnected from MongoDB");
    }

}

exports.getRole = async (req, res) => {
    try {
        // Connect to MongoDB
        await connectMongoDB();

        // Check if user already exists
        let user = await User.findOne({ sub: req.user.sub });

        if (!user) {
            res.status(200).json({ message:'User not found'});
        }
        else{
            // Get the user's role
            const role = user.role;
            res.status(200).json({ role });
        }
    } catch (error) {
        console.error('Error retrieving role', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    finally {
        // Disconnect from the database
        await disconnectMongoDB();
        console.log("Disconnected from MongoDB");
    }
}

exports.changeToAdmin = async (req, res) => {
    try {
        // Connect to MongoDB
        await connectMongoDB();

        // Check if user already exists
        let user = await User.findOne({ sub: req.user.sub });

        if (!user) {
            res.status(200).json({ message: 'User not found' });
        }
        else{
            user.role = "admin";
            await user.save();
            res.status(200).json({ message: "Role changed to admin" });
        }
    } catch (error) {
        console.error('Error changing role', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    finally {
        // Disconnect from the database
        await disconnectMongoDB();
        console.log("Disconnected from MongoDB");
    }
}