const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = require('./app');
const consumeMessages = require('./consumer');

const PORT = 4004;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}!`);
    consumeMessages();
});
