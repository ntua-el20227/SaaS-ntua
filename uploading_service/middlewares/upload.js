const multer = require("multer");
const fs = require('fs');

const jsonFilter = (req, file, cb) => {
    if (file.originalname.endsWith('.json')) {
        cb(null, true);
    } else {
        cb("Please upload only json file.", false);
    }
};

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("Reached" +
            "" +
            " upload middleware from route:", req.route.path);
        let multerdestination = __dirname + '/../uploads';
        console.log(multerdestination);
        fs.mkdir(multerdestination, function(err) {
            if (err && err.code !== "EEXIST") cb(err);
            else cb(null, multerdestination);
        });
    },

    filename: function (req, file, cb) {

        // Define the output file name based on the route
        let outputFileName;
        if (req.route.path === '/upload/file') {
            outputFileName = 'file.json';
        }
        else {
            outputFileName = file.originalname;
        }
        cb(null, outputFileName);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: jsonFilter,
    // Accepts only one file with the field name 'file'
    limits: { files: 1 }
})

module.exports = upload;