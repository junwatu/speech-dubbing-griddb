import fs from 'fs';
import path from 'path';
import multer from 'multer';
import express from 'express';
import ffmpeg from 'fluent-ffmpeg';
import { generateRandomID } from './lib/rangen.js';

import { processAudio } from './lib/openaiAudioProcessor.js';
import { __dirname } from './dirname.js';

import griddb from './db/griddb.js';
import store from './db/griddbClient.js';
import { getOrCreateContainer, insertData, queryData, queryDataById } from './db/griddbOperations.js';

const app = express();
const PORT = process.env.VITE_PORT || 3000;

app.use(express.json());
app.use(express.static('uploads'));
app.use(express.static('www'));
app.use(express.static('translations'));


const containerName = 'SpeechDubbingContainer';
const columnInfoList = [
	['id', griddb.Type.INTEGER],
	['originalAudio', griddb.Type.STRING],
	//['originalTranscription', griddb.Type.STRING],
	['targetAudio', griddb.Type.STRING],
	['targetTranscription', griddb.Type.STRING],
	//['score, gridb.Type.DOUBLE]
];

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
		const translationsDir = path.join(__dirname, 'translations');

		// Ensure translations directory exists
		if (!fs.existsSync(translationsDir)) {
			fs.mkdirSync(translationsDir, { recursive: true });
		}

		// Process audio using OpenAI
		const result = await processAudio(base64str, language);
		const filename = `translation-${language}.mp3`;
		const targetAudio = path.join(translationsDir, filename);

		fs.writeFileSync(
			targetAudio,
			Buffer.from(result.message.audio.data, 'base64'),
			{ encoding: "utf-8" }
		);

		//save data to GridDB database
		try {
			const container = await getOrCreateContainer(containerName, columnInfoList);
			await insertData(container, [generateRandomID(), mp3FilePath, targetAudio, result.message.audio.transcript]);
		} catch (error) {
			console.log(error)
		}

		const dataResponse = {
			language,
			filename,
			result
		}

		res.status(200).json(dataResponse);

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


app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
