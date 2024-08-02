const axios = require('axios');
require('dotenv').config();

const authenticateGoogleOAuth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Basic Auth for testing
    const testUsername = "testUser"; // Replace with your test username
    const testPassword = "testPass"; // Replace with your test password

    if (authHeader && authHeader.startsWith('Basic ')) {
        // Verify auth credentials
        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [username, password] = credentials.split(':');

        if (username === testUsername && password === testPassword) {
            // Create a fake req.user object with a static sub value
            req.user = {
                sub: 666 // replace "static_value" with the static value you want to use for testing
            };
            next();
            return;
        } else {
            // Invalid credentials provided return json response
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    }

    if (!token) return res.status(401).json({ message: 'Token not provided' });

    try {
        // Step 1: Validate the Google OAuth token using Google's tokeninfo endpoint
        const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?access_token=${token}`);
        const payload = response.data;

        // Step 2: Verify that the token is intended for your Google OAuth client
        if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
            console.error('Token audience mismatch');
            return res.status(403).json({ message: 'Token audience mismatch' });
        }

        // Attach the payload to the request
        req.user = payload;
        next();
    } catch (error) {
        console.error('Token verification error:', error.response?.data || error.message);
        return res.status(403).json({ message: 'Token verification failed', error: error.response?.data || error.message });
    }
};

module.exports = authenticateGoogleOAuth;
