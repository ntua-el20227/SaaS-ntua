const Solution = require('../models/solution');
const {connectMongoDB, disconnectMongoDB} = require("../utils/mongodb");

exports.healthcheck = (req, res) => { //??????
    res.json({ message: 'Hello from solutions controller' });
}

exports.getUserSolution = async (req, res) => {
    try {
        await connectMongoDB();
        const sub = req.user.sub;
        // Find all submissions where the metadata.uid matches the user's ID
        const userSolutions = await Solution.find({ "sub": sub } );

        res.status(200).json(userSolutions);
    } catch (error) {
        console.error("Error retrieving user solutions:", error);
        res.status(500).json({ message: "An error occurred while retrieving user solutions" , error: error.message});
    }
    finally {
        // Disconnect from the database
        await disconnectMongoDB();
        console.log("Disconnected from MongoDB");
    }
    /* Connect to the database and retrieve the user's solutions */
    /* We just want to retrieve all the available solutions ids for the specific user , not their details  */
}

exports.getUserDetailSolutionById = async (req, res) => {
    try {
        await connectMongoDB();
        //const userId = req.user.sub; // Assuming req.user.sub contains the user ID
        const problemId = req.params.SolutionId; // Assuming the solution ID is passed as a URL parameter


        // Find the specific solution by ID and user ID
        const userSolution = await Solution.findOne({ ProblemId: problemId});

        res.status(200).json(userSolution);
    } catch (error) {
        console.error("Error retrieving user solution details:", error);
        res.status(500).json({ error: "An error occurred while retrieving the user solution details" });
    }
    finally {
        // Disconnect from the database
        await disconnectMongoDB();
        console.log("Disconnected from MongoDB");
    }
};

exports.getAllSolutions = async (req, res) => {
    try {
        await connectMongoDB();
        // Find all submissions where the metadata.uid matches the user's ID
        const userSubmissions = await Solution.find({});
        res.status(200).json(userSubmissions);
    } catch (error) {
        console.error("Error retrieving solutions:", error);
        res.status(500).json({ message: "An error occurred while retrieving solutions", error: error.message});
    }
    finally {
        // Disconnect from the database
        await disconnectMongoDB();
        console.log("Disconnected from MongoDB");
    }
}