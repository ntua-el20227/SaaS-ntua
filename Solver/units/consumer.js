const fs = require("fs");
const path = require("path");
const amqp = require("amqplib");
const { exec } = require("child_process");
const separateJSON = require("./separateJSON");
const produceMessages = require("./producer");

async function consumeMessages() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URI);
        const channel = await connection.createChannel();

        await channel.assertExchange(process.env.EXCHANGE_NAME_BEFORE_SOLVER, "fanout", { durable: true });
        const {queue} = await channel.assertQueue(process.env.QUEUE_NAME, { durable: true });
        await channel.bindQueue(queue, process.env.EXCHANGE_NAME_BEFORE_SOLVER, "");

        // Set the prefetch count to 1
        channel.prefetch(1);

        console.log(" [*] Waiting for messages in the queue. To exit, press CTRL+C");

        await channel.consume(queue, async (msg) => {
            console.log("Message received from the queue.");
            if (msg.content) {
                console.log("Message content received.");
                try {
                    const content = msg.content.toString();
                    const {metadataFilePath, locationFilePath} = await separateJSON(content);
                    //print the message u consumed
                    console.log(content);
                    console.log("Metadata file path: ", metadataFilePath);
                    console.log("Location file path: ", locationFilePath);
                    const metadataContent = fs.readFileSync(metadataFilePath);

                    //Convert the metadata content to JSON
                    const parameters = JSON.parse(metadataContent);
                    console.log(parameters);

                    const numvehicles = parameters.v_number;
                    const depot = parameters.depot;
                    const maxdistance = parameters.max_dist;
                    const sub = parameters.sub;
                    const solver_name = parameters.solver_name;
                    const problemId = parameters.problemId;

                    if (solver_name === "vrpSolver") {
                        const pythonCommand = 'python3';

                        const command = `${pythonCommand} vrpSolver.py ${locationFilePath} ${numvehicles} ${depot} ${maxdistance}`;

                        const startTime = new Date();

                        exec(command, async (error, stdout, stderr) => {
                            if (error) {
                                console.error("Error running Python script:", error);
                                channel.ack(msg);
                                return;
                            }

                            const endTime = new Date();
                            const duration = endTime - startTime;

                            // Call the producer function
                            await produceMessages(sub, problemId, duration, stdout);

                            channel.ack(msg);
                        });
                    } else {
                        console.log(`Unsupported solver name: ${solver_name}`);
                        channel.ack(msg);
                    }
                } catch (error) {
                    console.error("Error processing message:", error);
                    channel.ack(msg);
                }
            }
        }, {noAck: false});
    } catch (error) {
        console.error("Error consuming messages:", error);
    }
}

module.exports = consumeMessages;