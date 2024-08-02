const fs = require('fs');
const path = require('path');
const Producer = require('../producer');
const uuid = require('uuid');

exports.upload_json = async (req, res) => {
    try {
        const inputFilePath = req.file.path;

        const Data = fs.readFileSync(inputFilePath, 'utf8');

        const locationData = JSON.parse(Data);

        if (typeof locationData !== 'object' || locationData === null) {
            fs.unlinkSync(inputFilePath);
            return res.status(400).json({ message: 'Invalid Json' });
        }
        if (!Array.isArray(locationData.Locations)) {
            fs.unlinkSync(inputFilePath);
            return res.status(400).json({ message: 'Invalid Json' });
        }
        for (const location of locationData.Locations) {
            if (typeof location !== 'object' || location === null) {
                fs.unlinkSync(inputFilePath);
                return res.status(400).json({ message: 'Invalid Json' });
            }
            if (typeof location.Latitude !== 'number' || typeof location.Longitude !== 'number') {
                fs.unlinkSync(inputFilePath);
                return res.status(400).json({ message: 'Invalid Json' });
            }
        }

        const v_number = req.body.v_number;
        console.log(v_number);

        const depot = req.body.depot;
        const max_dist = req.body.max_dist;
        const sub = req.user.sub;
        const solver_name = req.body.solver_name;
        const problemId = uuid.v4();
        const current_time = new Date().toISOString();

        if (isNaN(Number(v_number)) || Number(v_number) < 0) {
            fs.unlinkSync(inputFilePath);
            return res.status(400).json({ message: 'Number of Vehicles has to be a positive integer!' });
        }

        if (isNaN(Number(max_dist)) || Number(max_dist) < 0) {
            fs.unlinkSync(inputFilePath);
            return res.status(400).json({ message: 'Maximum Distance has to be a positive integer!' });
        }

        if (isNaN(Number(depot)) || Number(depot) < 0) {
            fs.unlinkSync(inputFilePath);
            return res.status(400).json({ message: 'Depot has to be a positive integer!' });
        }
        const metadata = {
            v_number,
            depot,
            max_dist,
            sub,
            solver_name,
            problemId,
            current_time
        };

        const directoryName = path.dirname(inputFilePath);

        const metadata_filePath = path.join(directoryName, 'metadata.json');

        await fs.writeFileSync(metadata_filePath, JSON.stringify(metadata, null, 2));

        const jsonData = {
            metadata: metadata,
            location: locationData
        };


        const jsonFilePath = path.join(directoryName, 'upload.json');

        await fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));

        const fileContent = fs.readFileSync(jsonFilePath);


        // Call the Producer function to upload the JSON file to RabbitMQ
        await Producer(fileContent)
            .then(  () => {
                return res.status(200).send('JSON file uploaded successfully!');
            })
            .catch(() => {
                return res.status(500).json({ message: 'Error uploading file on broker' });
            });

    } catch (err) {
        const message = "Error uploading file.";
        console.error('Error uploading file:', err);
        res.status(500).json({ message });
    }
};

exports.get_active_models = async (req, res) => {
    /* Get the active models from the database */
};
