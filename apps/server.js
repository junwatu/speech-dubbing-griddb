import fs from 'fs';
import path from 'path';
import multer from 'multer';
import express from 'express';
import { processAudio } from './lib/openaiAudioProcessor.js';
import { __dirname } from './dirname.js';
import ffmpeg from 'fluent-ffmpeg';

/**
import griddb from './db/griddb.js';
import store from './db/griddbClient.js';
import { getOrCreateContainer, insertData, queryData, queryDataById } from './db/griddbOperations.js';
*/

const app = express();
const PORT = 5555;

app.use(express.json());
app.use(express.static('uploads'));
app.use(express.static('www'));

/**
const containerName = 'myContainer';
const columnInfoList = [
	['id', griddb.Type.INTEGER],
	['original', griddb.Type.STRING],
	['originalText', griddb.Type.STRING],
	['translated', griddb.Type.STRING],
    ['translatedText', griddb.Type.String]
];
*/

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads/'); 
	},
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}-${file.originalname}`); 
	}
});

const upload = multer({ storage });

app.get('/', async (req, res) => {
	res.sendFile('index.html');
})

/**
app.post('/insert', async (req, res) => {
	const { id, name, value } = req.body;

	if (id == null || !name || value == null) {
		return res.status(400).json({ error: 'Missing required fields: id, name, value' });
	}

	try {
		const container = await getOrCreateContainer(containerName, columnInfoList);
		await insertData(container, [id, name, value]);
		res.status(201).json({ message: 'Data inserted successfully' });
	} catch (err) {
		console.error('Error in /insert:', err.message);
		res.status(500).json({ error: 'Failed to insert data' });
	}
});

app.get('/query', async (req, res) => {
	try {
		const container = await store.getContainer(containerName);
		const result = await queryData(container);
		res.status(200).json({ data: result });
	} catch (err) {
		console.error('Error in /query:', err.message);
		res.status(500).json({ error: 'Failed to query data' });
	}
});

app.get('/query/:id', async (req, res) => {
	const { id } = req.params;

	try {
		const container = await store.getContainer(containerName);
		const result = await queryDataById(id, container, store);
		if (result.length > 0) {
			res.status(200).json({ data: result });
		} else {
			res.status(404).json({ message: 'Data not found' });
		}
	} catch (err) {
		console.error('Error in /query/:id:', err.message);
		res.status(500).json({ error: 'Failed to query data by ID' });
	}
});

*/

/**
app.post('/upload-audio', upload.single('audio'), async (req, res) => {
	if (!req.file) {
		return res.status(400).json({ error: 'No file uploaded' });
	}

	const filePath = path.join(__dirname, req.file.path);

	try {
		// Read uploaded file and convert to base64
		//debug fixed path
		const audioBuffer = fs.readFileSync(path.join(__dirname, 'uploads', 'recorded-audio.wav'));
		console.log(audioBuffer);

		const base64str = Buffer.from(audioBuffer).toString('base64');
		console.log(base64str);

		const language = "Japanese";

		// Process audio using OpenAI
		const result = await processAudio(debugAudioBase64, language);

		writeFileSync(
			`translation-${language}.wav`,
			Buffer.from(result.message.audio.data, 'base64'),
			{ encoding: "utf-8" }
		);

		// Return OpenAI's response
		res.status(200).json({ message: 'Audio processed successfully', result });
	} catch (error) {
		console.error('Error processing audio:', error.message);
		res.status(500).json({ error: 'Failed to process audio' });
	} finally {
		// Clean up uploaded file
		fs.unlinkSync(filePath);
	}
});
*/

app.post('/upload-audio', upload.single('audio'), async (req, res) => {
	// Check if file was uploaded
	if (!req.file) {
		return res.status(400).json({ error: 'No file uploaded' });
	}

	const originalFilePath = req.file.path;
	const fileExtension = path.extname(req.file.originalname).toLowerCase();
	const fileNameWithoutExt = path.basename(req.file.originalname, fileExtension);
	const mp3FilePath = path.join(
		path.dirname(originalFilePath),
		`${fileNameWithoutExt}.mp3`
	);

	try {
		// Function to convert audio to MP3
		const convertToMp3 = () => {
			return new Promise((resolve, reject) => {
				ffmpeg(originalFilePath)
					.toFormat('mp3')
					.on('error', (err) => {
						console.error('Conversion error:', err);
						reject(err);
					})
					.on('end', () => {
						// Remove the original file after conversion
						fs.unlinkSync(originalFilePath);
						resolve(mp3FilePath);
					})
					.save(mp3FilePath);
			});
		};

		// Convert to MP3 if not already in MP3 format
		if (fileExtension !== '.mp3') {
			await convertToMp3();
		} else {
			// If already MP3, just use the original file
			fs.renameSync(originalFilePath, mp3FilePath);
		}

		// Read converted MP3 file
		const audioBuffer = fs.readFileSync(mp3FilePath);
		const base64str = Buffer.from(audioBuffer).toString('base64');

		const language = "Japanese";

		// Process audio using OpenAI
		const result = await processAudio(base64str, language);

		// Write translation 
		fs.writeFileSync(
			`translation-${language}.mp3`,
			Buffer.from(result.message.audio.data, 'base64'),
			{ encoding: "utf-8" }
		);

		// Return OpenAI's response
		res.status(200).json({
			message: 'Audio processed successfully',
			originalFormat: fileExtension,
			result
		});

	} catch (error) {
		console.error('Error processing audio:', error.message);

		// Cleanup any temporary files
		if (fs.existsSync(mp3FilePath)) {
			fs.unlinkSync(mp3FilePath);
		}
		if (fs.existsSync(originalFilePath)) {
			fs.unlinkSync(originalFilePath);
		}

		res.status(500).json({ error: 'Failed to process audio' });
	}
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
