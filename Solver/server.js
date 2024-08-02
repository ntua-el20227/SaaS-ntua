const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = require('./app');
const consumeMessages = require('./units/consumer');

const PORT = 4001;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}!`);
    consumeMessages();
});
