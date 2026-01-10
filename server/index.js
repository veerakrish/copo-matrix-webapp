import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateCOPOMatrix } from './copoLogic.js';
import { getPOData } from './poData.js';
import { extractSyllabusText, extractSyllabusTopics } from './syllabusParser.js';
import { generateDOCX } from './docxGenerator.js';
import fs from 'fs';

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file explicitly from project root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Debug: Check if API key is loaded
if (process.env.MISTRALAI_API_KEY) {
  const keyPreview = process.env.MISTRALAI_API_KEY.substring(0, 10) + '...';
  console.log(`✓ MISTRALAI_API_KEY loaded from .env file (${keyPreview})`);
} else {
  console.warn('⚠ MISTRALAI_API_KEY not found in .env file');
  console.warn('   Make sure .env file exists in the project root with: MISTRALAI_API_KEY="your_key"');
}

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(bodyParser.json());

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.'));
    }
  }
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve PO data
app.get('/api/po-data', (req, res) => {
  res.json(getPOData());
});

// Upload and parse syllabus
app.post('/api/upload-syllabus', upload.single('syllabus'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;

    // Extract text from syllabus
    const text = await extractSyllabusText(filePath, mimeType);
    
    // Extract topics and structure
    const syllabusData = extractSyllabusTopics(text);

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      syllabusData: syllabusData
    });
  } catch (error) {
    console.error('Error processing syllabus:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

// Generate CO-PO Matrix (with optional syllabus data)
app.post('/api/generate-matrix', async (req, res) => {
  try {
    const { courseName, courseCode, courseOutcomes, syllabusData } = req.body;
    
    if (!courseName || !courseCode || !courseOutcomes || courseOutcomes.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate matrix (now async due to LLM integration)
    const result = await generateCOPOMatrix(courseOutcomes, syllabusData);
    res.json(result);
  } catch (error) {
    console.error('Error generating matrix:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download CO-PO-PSO Matrix as DOCX
app.post('/api/download-docx', async (req, res) => {
  try {
    console.log('DOCX download request received');
    const { matrixResult, courseName, courseCode, courseOutcomes } = req.body;
    
    if (!matrixResult || !courseName || !courseCode || !courseOutcomes) {
      console.error('Missing required fields:', { matrixResult: !!matrixResult, courseName: !!courseName, courseCode: !!courseCode, courseOutcomes: !!courseOutcomes });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Generating DOCX document...');
    // Generate DOCX document
    const docxBuffer = await generateDOCX(matrixResult, courseName, courseCode, courseOutcomes);
    
    if (!docxBuffer || docxBuffer.length === 0) {
      console.error('Generated buffer is empty');
      return res.status(500).json({ error: 'Failed to generate document - empty buffer' });
    }
    
    console.log('DOCX buffer generated, size:', docxBuffer.length);
    console.log('Buffer type:', Buffer.isBuffer(docxBuffer) ? 'Buffer' : typeof docxBuffer);
    
    // Set headers for file download
    const fileName = `${courseCode}_CO_PO_PSO_Matrix.docx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    
    // Ensure it's a Buffer
    const buffer = Buffer.isBuffer(docxBuffer) ? docxBuffer : Buffer.from(docxBuffer);
    res.setHeader('Content-Length', buffer.length);
    
    // Send the buffer
    console.log('Sending DOCX buffer to client, size:', buffer.length);
    res.end(buffer);
  } catch (error) {
    console.error('Error generating DOCX:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message || 'Failed to generate document' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

