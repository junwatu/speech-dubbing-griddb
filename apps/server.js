import express from 'express';
import multer from 'multer';

/**
import griddb from './db/griddb.js';
import store from './db/griddbClient.js';
import { getOrCreateContainer, insertData, queryData, queryDataById } from './db/griddbOperations.js';
*/

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('uploads')); // Serve uploaded files statically if needed
app.use(express.static('www'));

/**
const containerName = 'myContainer';
const columnInfoList = [
	['id', griddb.Type.INTEGER],
	['name', griddb.Type.STRING],
	['value', griddb.Type.DOUBLE],
];
*/

// Configure multer for file storage
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads/'); // Specify the directory for audio files
	},
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}-${file.originalname}`); // Use timestamp for unique filenames
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

app.post('/upload-audio', upload.single('audio'), (req, res) => {
	if (!req.file) {
		return res.status(400).json({ error: 'No file uploaded' });
	}
	res.status(201).json({
		message: 'Audio uploaded successfully',
		filePath: `/uploads/${req.file.filename}`
	});
});


app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
