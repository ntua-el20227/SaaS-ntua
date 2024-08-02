const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = require('./app');
const consumeCredits = require('./consumer');

const PORT = 4003;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}!`);
    consumeCredits();
});
