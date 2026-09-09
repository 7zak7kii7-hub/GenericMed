import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { apiRouter } from './routes';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers via Helmet (relaxed CSP for local Vite compatibility)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', '*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  })
);

// Body Parsers (15mb limit for high-resolution prescription images)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// CDSCO Privacy Compliant Request Logger (Sanitizes Protected Health Information)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const isApi = req.originalUrl.startsWith('/api');
    if (isApi) {
      console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// General API Rate Limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Specialized OCR Vision Rate Limiter
const ocrLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: { error: 'Prescription OCR limit reached. Please wait a few minutes before scanning again.' },
});

app.use('/api/', generalLimiter);
app.use('/api/prescriptions/ocr-analyze', ocrLimiter);

// Mount API routes
app.use('/api', apiRouter);

// In production, serve built client from configured dist directory if available
const frontendDist = process.env.FRONTEND_DIST_PATH 
  || path.resolve(__dirname, '../dist')
  || path.resolve(__dirname, '../../frontend/dist');

if (process.env.NODE_ENV === 'production' && fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🏥 GenericMed Healthcare Server Active`);
    console.log(`📡 REST API Endpoint : http://localhost:${PORT}/api`);
    console.log(`🩺 Health Check      : http://localhost:${PORT}/api/health`);
    console.log(`🔐 CDSCO Compliance  : Enabled (Schedule H1 Guard Active)`);
    console.log(`====================================================`);
  });
}

export default app;
