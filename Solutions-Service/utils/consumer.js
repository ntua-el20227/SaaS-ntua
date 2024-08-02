const fs = require("fs");
const amqp = require("amqplib");
const moment = require("moment-timezone");
const Solution = require("../models/solution");
const { connectMongoDB, disconnectMongoDB } = require("../utils/mongodb");
require('dotenv').config();

function calculateCredit(duration) {
    // For less than 1 min duration 1 credit charged and for every extra ceil(minute) extra 2 credits charged
    // For example, 1 min 30 sec duration will charge 3 credits 2min 30 sec will charge 5 credits
    const minutes = Math.ceil(duration / 60000); // Convert milliseconds to minutes
    return minutes + (minutes - 1); // 1 credit for the first minute, 2 for the second, and so on
}

async function processMessage(content) {
    try {
        const itemData = JSON.parse(content);

        // Check if itemData includes "No solution found !"
        if (itemData.Stdout.includes("No solution found !")) {
            // Connect to MongoDB
            await connectMongoDB();

            // Create a new document using the Solution model with default values
            const solutionDocument = new Solution({
                sub: itemData.Sub,
                ProblemId: itemData.ProblemId,
                Duration: itemData.Duration,
                CreditValue: calculateCredit(itemData.Duration),
                Objective: 0,  // Adjust default values as needed
                Routes: [],
                max_route_distance: 0,  // Adjust default values as needed
                receivedAt: moment().tz('Europe/Athens').format('YYYY-MM-DD HH:mm:ss')
            });

            // Save the document to MongoDB
            await solutionDocument.save();

            // Disconnect from MongoDB
            await disconnectMongoDB();
        } else {
            // Extract values using regex
            const objectiveMatch = itemData.Stdout.match(/Objective: (\d+)/);
            const maxRouteDistanceMatch = itemData.Stdout.match(/Maximum of the route distances: (\d+)m/);

            if (!objectiveMatch || !maxRouteDistanceMatch) {
                console.error('Invalid format in Stdout');
                throw new Error('Invalid format in Stdout');
            }

            // Connect to MongoDB
            await connectMongoDB();

            // Create a new document using the Solution model
            const solutionDocument = new Solution({
                sub: itemData.Sub,
                ProblemId: itemData.ProblemId,
                Duration: itemData.Duration,
                CreditValue: calculateCredit(itemData.Duration),
                Objective: parseInt(objectiveMatch[1], 10),
                Routes: parseRoutes(itemData.Stdout),
                max_route_distance: parseInt(maxRouteDistanceMatch[1], 10),
                receivedAt: moment().tz('Europe/Athens').format('YYYY-MM-DD HH:mm:ss')
            });

            // Save the document to MongoDB
            await solutionDocument.save();

            // Disconnect from MongoDB
            await disconnectMongoDB();
        }
    } catch (error) {
        console.error("Error processing message:", error);
        throw error; // Re-throw error to ensure proper handling
    }
}
const parseRoutes = (stdout) => {
    const routePattern = /Route for vehicle (\d+):\r?\n (.*?)\r?\nDistance of the route: (\d+)m/g;
    const routes = [];
    let match;

    while ((match = routePattern.exec(stdout)) !== null) {
        const vehicle = parseInt(match[1], 10);
        const route = match[2].split(' -> ').map(Number);
        const distance = parseInt(match[3], 10);
        routes.push({ vehicle, route, distance });
        //console.log('Route:', { vehicle, route, distance });
    }

    return routes;
};

async function consumeSolutions() {
    try {

        const connection = await amqp.connect(process.env.RABBITMQ_URI);
        const channel = await connection.createChannel();

        const exchangeName = process.env.EXCHANGE_NAME;
        const routingKey_q_A = process.env.ROUTING_KEY_Q_A;
        await channel.assertExchange(exchangeName, "direct", { durable: true });
        const { queue } = await channel.assertQueue(process.env.QUEUE_NAME, { durable: true });
        await channel.bindQueue(queue,exchangeName, routingKey_q_A);

        console.log(" [*] Waiting for messages in the queue. To exit, press CTRL+C");

        // In-memory message processing queue
        let processing = false;
        let messageQueue = [];

        channel.consume(queue, async (msg) => {
            console.log("Message received from the queue upload4Solutions.");
            if (msg.content) {
                console.log("Message content received.");
                messageQueue.push(msg);

                if (!processing) {
                    processing = true;
                    while (messageQueue.length > 0) {
                        const currentMsg = messageQueue.shift();
                        try {
                            await processMessage(currentMsg.content.toString());
                            channel.ack(currentMsg);
                        } catch (error) {
                            channel.ack(currentMsg); // Acknowledge to avoid reprocessing
                        }
                    }
                    processing = false;
                }
            }
        }, { noAck: false });

    } catch (error) {
        console.error("Error consuming messages:", error);
    }
}

module.exports = consumeSolutions;
