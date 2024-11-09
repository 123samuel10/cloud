const { Storage } = require('@google-cloud/storage');
const path = require('path');

const storage = new Storage({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    keyFilename: process.env.GOOGLE_CLOUD_CREDENTIALS_PATH,
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);

module.exports = {
    bucket,
    storage,
};
