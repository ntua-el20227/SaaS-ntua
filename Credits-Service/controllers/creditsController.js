
//export let getAllCredits = undefined;
const { connectMongoDB, disconnectMongoDB } = require("../utils/mongodb");
require('dotenv').config();
const CreditSchema = require("../models/credits");


exports.getUserCredits = async (req, res) => {
    try {
        await connectMongoDB();

        const criteria = {
            sub: req.user.sub
        };

        // Find the user's credits
        const credits = await CreditSchema.findOne(criteria);

        return res.status(200).json(credits);

    } catch (error) {
        console.error('Error fetching user credits:', error);
        return res.status(500).json({ message: 'Failed to fetch credits', error: error.message });
    }
    finally {
        // Disconnect from the database
        await disconnectMongoDB();
        console.log("Disconnected from MongoDB");
    }
};

exports.getAllUserCredits = async (req, res) => {
    try {
        await connectMongoDB();

        // Find the user's credits
        const Allcredits = await CreditSchema.find({});

        return res.status(200).json(Allcredits);

    } catch (error) {
        console.error('Error fetching user credits:', error);
        return res.status(500).json({ message: 'Failed to fetch credits', error: error.message });
    }
    finally {
        // Disconnect from the database
        await disconnectMongoDB();
        console.log("Disconnected from MongoDB");
    }
};

exports.createUserCreditRegistry = async (req, res) => {
    try {
        await connectMongoDB();

        const { sub, creditValue= 0, creditSum = 0, receivedAt } = req.body;

        const newCredit = new CreditSchema({
            sub,
            creditValue,
            creditSum,
            receivedAt
        });

        await newCredit.save();

        return res.status(201).json({ message: 'User registry created successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while creating user registry', error: error.message });
    } finally {
        // Disconnect from the database
        await disconnectMongoDB();
        console.log("Disconnected from MongoDB");
    }
}

// add credits to user
exports.addUserCredits = async (req, res) => {
    try {
        await connectMongoDB();

        const creditValue= req.params.CreditValue;
        const Id = req.user.sub;
        

        await CreditSchema.updateOne(
            { sub: Id  },
            {
                $inc: {
                    creditValue: creditValue, // Increase creditValue
                    creditSum: 0  // Increase creditSum
                },
                $set: { receivedAt: new Date().toLocaleString('en-US', { timeZone: 'Europe/Minsk' }) }
            },
            { upsert: true }
        );

        return res.status(200).json({ message: 'Credits added successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while adding credits', error: error.message });
    } finally {
        // Disconnect from the database
        await disconnectMongoDB();
        console.log("Disconnected from MongoDB");
    }
}

exports.getTopCredits = async (req,res) => {
    try {
        // Connect to the database
        await connectMongoDB();
        console.log("Connected to MongoDB");

        // Find the top 10 users with the biggest credit sum
        const topCredits = await CreditSchema.find().sort({creditSum: -1}).limit(10);

        console.log(topCredits);
        return res.status(200).json(topCredits);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred', error: error.message });
    }
    finally {
        // Disconnect from the database
        await disconnectMongoDB();
        console.log("Disconnected from MongoDB");
    }

}

exports.getTotalCredits = async (req, res) => {
    try {
        // Connect to the database
        await connectMongoDB();
        console.log("Connected to MongoDB");

        // Calculate the total number of credits by summing all creditSum values
        const totalCredits = await CreditSchema.aggregate([
            {
                $group: {
                    _id: null,
                    totalCredits: { $sum: "$creditSum" }
                }
            }
        ]);
        const total = totalCredits.length > 0 ? totalCredits[0].totalCredits : 0;
        return res.status(200).json({ totalCredits: total });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred', error: error.message });
    }
    finally {
        // Disconnect from the database
        await disconnectMongoDB();
        console.log("Disconnected from MongoDB");
    }
}
