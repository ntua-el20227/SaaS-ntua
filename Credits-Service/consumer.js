const amqp = require("amqplib");
const Credits = require("./models/credits");
const { connectMongoDB, disconnectMongoDB } = require("./utils/mongodb");

function calculateCredit(duration) {
    const minutes = Math.ceil(duration / 60000);
    return minutes + (minutes - 1);
}

const updateUserCredits = async (Sub, creditValue) => {
    try {
        const mongoClient = await connectMongoDB();

        const parsedCreditValue = parseInt(creditValue, 10);
        console.log("Parsed credit value: ", parsedCreditValue);
        console.log("Sub: ", Sub);
        console.log("Credit value: ", creditValue);

        await Credits.updateOne(
            { sub: Sub },
            {
                $inc: {
                    creditValue: -parsedCreditValue,
                    creditSum: parsedCreditValue
                },
                $set: { receivedAt: new Date().toLocaleString('en-US', { timeZone: 'Europe/Minsk' }) }
            },
            { upsert: true }
        );

        console.log('Credits updated successfully');
    } catch (error) {
        console.error('An error occurred while adding credits:', error.message);
    } finally {
        await disconnectMongoDB();
        console.log("Disconnected from MongoDB");
    }
};

async function consumeCredits() {
    let connection = null;
    let channel = null;

    try {
        connection = await amqp.connect(process.env.RABBITMQ_URI);
        channel = await connection.createChannel();

        const exchangeName = process.env.EXCHANGE_NAME;
        const routingKey_q_B = process.env.ROUTING_KEY_Q_B;
        await channel.assertExchange(exchangeName, "direct", { durable: true });
        const { queue } = await channel.assertQueue(process.env.QUEUE_NAME, { durable: true });
        await channel.bindQueue(queue, exchangeName, routingKey_q_B);

        channel.prefetch(1);
        console.log(" [*] Waiting for credits in the queue. To exit, press CTRL+C");

        await channel.consume(queue, async (msg) => {
            if (msg.content) {
                try {
                    console.log("Received message:", msg.content.toString());

                    const content = JSON.parse(msg.content.toString());
                    console.log("Parsed message content:", content);

                    const { Sub, Duration } = content;
                    const creditValue = calculateCredit(Duration);
                    console.log("Calculated credits:", creditValue);

                    await updateUserCredits(Sub, creditValue);
                    channel.ack(msg);
                } catch (error) {
                    console.error("Error processing message:", error);
                    channel.nack(msg, false, false);  // Reject the message without requeue
                }
            }
        }, { noAck: false });
    } catch (error) {
        console.error("Error consuming credits:", error);
    }
}

module.exports = consumeCredits;