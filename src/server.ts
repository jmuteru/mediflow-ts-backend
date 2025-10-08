import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { apiReference } from '@scalar/express-api-reference';
import { swaggerSpec } from './docs/openapi.js';
import authRoutes from './routes/auth.routes.js';
import patientRoutes from './routes/patient.routes.js';
import medicationRoutes from './routes/medication.routes.js';
import prescriptionRoutes from './routes/prescription.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import diagnosisRoutes from './routes/diagnosis.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import userRoutes from './routes/user.routes.js';



import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Security headers
app.use('/docs', helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "script-src": ["'self'", "'unsafe-inline'", "https:"],
      "style-src": ["'self'", "'unsafe-inline'", "https:"],
      "img-src": ["'self'", "data:", "https:"]
    }
  }
}));
// CORS
app.use(cors());
// Compression
app.use(compression());
// Parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Basic rate limit
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api', limiter);
// Sanitize NoSQL injection
app.use(mongoSanitize());
// Prevent HTTP param pollution
app.use(hpp());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Root
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'MediHeal API',
    version: '1.0.0',
    description: 'Backend API service for healthcare/medical application'
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/diagnoses', diagnosisRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', userRoutes);

// Scalar API Docs (serves an interactive reference)
app.use('/docs', apiReference({
  theme: 'kepler',
  layout: 'modern',
  // @ts-expect-error: apiReference config type from @scalar/core may not include spec property in typings
  spec: { url: '/openapi.json' }
}));

// Serve generated OpenAPI spec
app.get('/openapi.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Error handler
app.use(errorHandler);

// Database
const mongoUri = process.env.MONGODB_URI || 'your-mongodb-uri';
mongoose
  .connect(mongoUri)
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB');
  })
  .catch((err: unknown) => {
    // eslint-disable-next-line no-console
    console.error(`MongoDB connection error: ${String(err)}`);
    process.exit(1);
  });

const PORT = process.env.PORT ? Number(process.env.PORT) : 5500;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('unhandledRejection', (err: unknown) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

export default app;

