const fs = require("fs");
const amqp = require("amqplib");
const separateJSON = require("./utils/separateJSON");
const Submissions = require("./models/submission");
const { connectMongoDB, disconnectMongoDB } = require("./utils/mongodb");

async function processMessage(content) {
    try {
        const { metadataFilePath, locationFilePath } = await separateJSON(content);

        const metadataContent = fs.readFileSync(metadataFilePath);
        const locationContent = fs.readFileSync(locationFilePath, 'utf8');
        const parsedLocationContent = JSON.parse(locationContent);

        const parameters = JSON.parse(metadataContent);
        const numvehicles = parameters.v_number;
        const depot = parameters.depot;
        const maxdistance = parameters.max_dist;
        const sub = parameters.sub;
        const solver_name = parameters.solver_name;
        const problemId = parameters.problemId;
        const current_time = parameters.current_time;

        // Connect to MongoDB
        await connectMongoDB();

        // Create a new document using the Submissions model
        const submissionDocument = new Submissions({
            ProblemId: problemId,
            metadata: {
                v_number: numvehicles,
                depot,
                max_dist: maxdistance,
                sub,
                solver_name,
            },
            fileContent: parsedLocationContent,
            receivedAt: current_time,
        });

        // Save the document to MongoDB
        await submissionDocument.save();

        // Disconnect from MongoDB
        await disconnectMongoDB();

    } catch (error) {
        console.error("Error processing message:", error);
        throw error; // Re-throw error to ensure proper handling
    }
}

async function consumeMessages() {
    try {

        const connection = await amqp.connect(process.env.RABBITMQ_URI);
        const channel = await connection.createChannel();

        await channel.assertExchange(process.env.EXCHANGE_NAME, "fanout", { durable: true });
        const { queue } = await channel.assertQueue(process.env.QUEUE_NAME, { durable: true });
        await channel.bindQueue(queue, process.env.EXCHANGE_NAME, "");

        console.log(" [*] Waiting for messages in the queue. To exit, press CTRL+C");

        // In-memory message processing queue
        let processing = false;
        let messageQueue = [];

        channel.consume(queue, async (msg) => {
            console.log("Message received from the queue upload4Submission.");
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

module.exports = consumeMessages;