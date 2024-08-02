const fs = require("fs");
const path = require("path");
const amqp = require("amqplib");

async function produceMessages(sub, problemId, duration, stdout) {
    let connection;
    let channel;
    try {
        // Connect to the RabbitMQ server using the URI from the .env file
        connection = await amqp.connect(process.env.RABBITMQ_URI);
        // Create a new channel
        channel = await connection.createChannel();
        // Create the exchange if it doesn't exist
        const exchangeName = process.env.EXCHANGE_NAME_AFTER_SOLVER;
        await channel.assertExchange(exchangeName, 'direct', { durable: true });

        const routingKey_q_A = process.env.ROUTING_KEY_Q_A;
        const routingKey_q_B = process.env.ROUTING_KEY_Q_B;

        // Ensure queues exist and bind them to the exchange
        // const queues = ["upload4Credits", "upload4Solutions"];
        // for (const queue of queues) {
        //     await channel.assertQueue(queue, { durable: true });
        //     await channel.bindQueue(queue, process.env.EXCHANGE_NAME_AFTER_SOLVER, "");
        // }

        const outputContent = {
            Sub: sub,
            ProblemId: problemId,
            Duration: duration,
            Stdout: stdout
        };

        const durationContent = {
            Sub: sub,
            ProblemId: problemId,
            Duration: duration
        };

        // Save output content to a file
        const outputFolderPath = path.join(__dirname, "outputs");
        fs.mkdirSync(outputFolderPath, { recursive: true });
        const outputFile = path.join(outputFolderPath, "output.json");
        fs.writeFileSync(outputFile, JSON.stringify(outputContent, null, 2));

        // Make the queues to public
        await channel.assertQueue("upload4Credits", { durable: true });
        await channel.assertQueue("upload4Solutions", { durable: true });

        // Bind the queues to the exchange
        await channel.bindQueue("upload4Credits", exchangeName, routingKey_q_B);
        await channel.bindQueue("upload4Solutions", exchangeName, routingKey_q_A);

        // Send output to output queue
        //const outputQueue = "upload4Solutions";
        channel.publish(exchangeName,routingKey_q_A, Buffer.from(JSON.stringify(outputContent)));

        // Send duration to duration queue
        //const durationQueue = "upload4Credits";
        channel.publish(exchangeName,routingKey_q_B, Buffer.from(JSON.stringify(durationContent)));

        console.log("Messages sent successfully.");
    } catch (error) {
        console.error("Error producing messages:", error);
    } finally {
        if (channel) {
            await channel.close();
        }
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = produceMessages;
