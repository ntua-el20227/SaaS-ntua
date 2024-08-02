const amqp = require("amqplib");
const fs = require("fs");



// Function to upload a file to RabbitMQ
async function Producer(fileContent) {
    try {
        const exchangeName = process.env.EXCHANGE_NAME;
        // Connect to the RabbitMQ server using the URI from the .env file
        const connection = await amqp.connect(process.env.RABBITMQ_URI);
        // Create a new channel
        const channel = await connection.createChannel();
        // Create the exchange if it doesn't exist
        await channel.assertExchange(exchangeName, "fanout", { durable: true });

        // Create the first queue if it doesn't exist
        await channel.assertQueue("upload4Solver", { durable: true });
        // Bind the first queue to the exchange
        await channel.bindQueue("upload4Solver", exchangeName, "");

        // Create the second queue if it doesn't exist
        await channel.assertQueue("upload4Submission", { durable: true });
        // Bind the second queue to the exchange
        await channel.bindQueue("upload4Submission", exchangeName, "");

        // Publish the JSON file to the fanout exchange (without specifying routing key)
        await channel.publish(exchangeName, "", Buffer.from(fileContent));

        // Log the message
        console.log(" [x] Sent JSON file");

        // Close the channel
        await channel.close();
        // Close the connection
        await connection.close();

        return Promise.resolve();
    } catch (error) {
        console.error(error);
        return Promise.reject(error);
    }
}

module.exports = Producer;
