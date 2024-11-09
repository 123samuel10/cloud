const express = require('express');
const router = express.Router();
const multer = require('multer');

const { bucket } = require('../config/storage');
const upload = multer({ storage: multer.memoryStorage() });

// Listar archivos
router.get('/', async (req, res) => {
    try {
        const [files] = await bucket.getFiles();
        const fileList = files.map(file => ({
            name: file.name,
            size: parseInt(file.metadata.size),
            contentType: file.metadata.contentType,
            created: file.metadata.timeCreated,
        }));
        res.render('index', { files: fileList });
    } catch (error) {
        res.status(500).send(`Error al listar archivos: ${error.message}`);
    }
});

// Subir archivo
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No se ha seleccionado ningún archivo');
        }

        const blob = bucket.file(req.file.originalname);
        const blobStream = blob.createWriteStream({
            resumable: false,
            metadata: {
                contentType: req.file.mimetype,
            },
        });

        blobStream.on('error', error => {
            res.status(500).send(`Error al subir el archivo: ${error.message}`);
        });

        blobStream.on('finish', () => {
            res.redirect('/');
        });

        blobStream.end(req.file.buffer);
    } catch (error) {
        res.status(500).send(`Error al procesar el archivo: ${error.message}`);
    }
});

// Descargar archivo
router.get('/download/:fileName', async (req, res) => {
    try {
        const fileName = req.params.fileName;
        const file = bucket.file(fileName);
        const [metadata] = await file.getMetadata();

        res.setHeader('Content-Type', metadata.contentType);
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        const downloadStream = file.createReadStream();
        downloadStream.pipe(res);
    } catch (error) {
        res.status(500).send(`Error al descargar el archivo: ${error.message}`);
    }
});

module.exports = router;
