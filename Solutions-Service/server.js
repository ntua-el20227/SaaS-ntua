const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = require('./app');
const consumeSolutions = require('./utils/consumer');

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}!`);
    consumeSolutions();
});
