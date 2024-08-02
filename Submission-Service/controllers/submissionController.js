
const Submission = require('../models/submission');
const {connectMongoDB, disconnectMongoDB} = require("../utils/mongodb");
const consumeSolutions = require('../consumer');

exports.getUserSubmissions = async (req, res) => {
    /* Connect to the database and retrieve the user's submissions */
    /* We just want to retrieve all the available submissions ids for the specific user , not their details  */
    try {
        await connectMongoDB();
        const sub = req.user.sub;
        // Find all submissions where the metadata.uid matches the user's ID
        const userSubmissions = await Submission.find({ "metadata.sub": sub } );
        res.status(200).json(userSubmissions);
    } catch (error) {
        console.error("Error retrieving user submissions:", error);
        res.status(500).json({ message : "An error occurred while retrieving user submissions", error: error.message });
    }
    finally {
        // Disconnect from the database
        await disconnectMongoDB();
        console.log("Disconnected from MongoDB");
    }
}

exports.getUserDetailSubmissionById = async (req, res) => {
    /* Connect to the database and retrieve the user's submission details  by ID */
    try{
        await connectMongoDB();
        const submissionId = req.params.SubmissionId;
        const SubmissionObject = await Submission.find({ "ProblemId": submissionId } );
        res.status(200).json(SubmissionObject);
    }
    catch (error) {
        console.error("Error retrieving user submissions:", error);
        res.status(500).json({ error: "An error occurred while retrieving user submissions" });
    }
    finally {
        // Disconnect from the database
        await disconnectMongoDB();
        console.log("Disconnected from MongoDB");
    }
}

exports.getAllSubmissions = async (req, res) => {

    try {
        await connectMongoDB();
        // Find all submissions where the metadata.uid matches the user's ID
        const userSubmissions = await Submission.find({});

        // Disconnect from MongoDB
        await disconnectMongoDB();

        res.status(200).json(userSubmissions);
    } catch (error) {
        console.error("Error retrieving user submissions:", error);
        res.status(500).json({ error: "An error occurred while retrieving user submissions" });
    }
    finally {
        // Disconnect from the database
        await disconnectMongoDB();
        console.log("Disconnected from MongoDB");
    }
    /* Connect to the database and retrieve all the submissions */
    /* We just want to retrieve all the available submissions ids for the whole system, not their details  */

}


exports.getTopUsers = async (req, res) => {
    try {
        // Connect to the database
        await connectMongoDB();
        console.log("Connected to MongoDB");

        // Get the top users
        const topUsers = await Submission.aggregate([
            {
                $group: {
                    _id: req.user.sub,
                    totalSubmissions: { $sum: 1 }
                }
            },
            {
                $sort: { totalSubmissions: -1 }
            },
            {
                $limit: 10
            }
        ]);

        console.log("Top users:", topUsers);
        res.status(200).json(topUsers);
    } catch (error) {
        console.error("Error getting top users:", error);
        return res.status(500).json({ message: "An error occurred while getting top users", error: error.message });
    }
    finally {
        // Disconnect from the database
        await disconnectMongoDB();
        console.log("Disconnected from MongoDB");
    }
}

exports.getTotalSubmissions = async (req, res) => {
    try {
        // Connect to the database
        await connectMongoDB();
        console.log("Connected to MongoDB");

        // Get the total number of submissions
        const totalSubmissions = await Submission.countDocuments();

        console.log("Total submissions:", totalSubmissions);
        res.status(200).json({ totalSubmissions });
    } catch (error) {
        console.error("Error getting total submissions:", error);
        return res.status(500).json({ message: "An error occurred while getting total submissions", error: error.message });
    }
    finally {
        // Disconnect from the database
        await disconnectMongoDB();
        console.log("Disconnected from MongoDB");
    }
}


exports.getSubmissionsPerMonth = async (req, res) => {
    try {
        // Connect to the database
        await connectMongoDB();
        console.log("Connected to MongoDB");

        // Get the submissions per month
        const submissionsPerMonth = await Submission.aggregate([
            {
                $group: {
                    _id: { $month: { $toDate: "$receivedAt" } },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    month: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$_id", 1] }, then: "January" },
                                { case: { $eq: ["$_id", 2] }, then: "February" },
                                { case: { $eq: ["$_id", 3] }, then: "March" },
                                { case: { $eq: ["$_id", 4] }, then: "April" },
                                { case: { $eq: ["$_id", 5] }, then: "May" },
                                { case: { $eq: ["$_id", 6] }, then: "June" },
                                { case: { $eq: ["$_id", 7] }, then: "July" },
                                { case: { $eq: ["$_id", 8] }, then: "August" },
                                { case: { $eq: ["$_id", 9] }, then: "September" },
                                { case: { $eq: ["$_id", 10] }, then: "October" },
                                { case: { $eq: ["$_id", 11] }, then: "November" },
                                { case: { $eq: ["$_id", 12] }, then: "December" }
                            ],
                            default: "Unknown"
                        }
                    },
                    count: 1
                }
            },
            {
                $sort: { _id: 1 }
            },
            {
                $group: {
                    _id: "$month",
                    count: { $sum: "$count" }
                }
            },
            {
                $project: {
                    month: "$_id",
                    count: 1,
                    _id: 0
                }
            },
            {
                $group: {
                    _id: null,
                    submissionsPerMonth: { $push: { month: "$month", count: "$count" } }
                }
            },
            {
                $project: {
                    _id: 0,
                    submissionsPerMonth: 1
                }
            }
        ]);

        console.log("Submissions per month:", submissionsPerMonth);
        res.status(200).json(submissionsPerMonth[0].submissionsPerMonth);
    } catch (error) {
        console.error("Error getting submissions per month:", error);
        return res.status(500).json({ message: "An error occurred while getting submissions per month", error: error.message });
    }
    finally {
        // Disconnect from the database
        await disconnectMongoDB();
        console.log("Disconnected from MongoDB");
    }
}