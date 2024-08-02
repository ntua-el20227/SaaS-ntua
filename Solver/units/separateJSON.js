const fs = require('fs');
const path = require('path');

async function separateJSON(jsonContent) {
    try {
        // Parse the JSON content
        const jsonData = JSON.parse(jsonContent);

        // Ensure the JSON structure contains `metadata` and `location`
        if (!jsonData.metadata || !jsonData.location) {
            throw new Error("Invalid JSON structure. Expected 'metadata' and 'location' fields.");
        }

        // Get the metadata and location data
        const metadata = jsonData.metadata;
        const locations = jsonData.location;

        // Define the folder path where the files will be saved
        const folderPath = path.join(__dirname, 'json_files');

        // Create the folder if it doesn't exist
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        // Create file paths for the metadata and location data
        const metadataFilePath = path.join(folderPath, 'metadata.json');
        const locationFilePath = path.join(folderPath, 'locations.json');

        // Save the metadata JSON to a file with pretty print
        fs.writeFileSync(metadataFilePath, JSON.stringify(metadata, null, 2));
        // Save the location data JSON to a file with pretty print
        fs.writeFileSync(locationFilePath, JSON.stringify(locations, null, 2));

        return { metadataFilePath, locationFilePath };
    } catch (error) {
        console.error("Error separating JSON:", error);
        throw error; // Rethrow the error to be caught by the caller
    }
}

module.exports = separateJSON;