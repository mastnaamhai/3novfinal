import express from 'express';
import path from 'path';
import cors from 'cors';
import connectDB from './config/database';
import config from './config/environment';
import customerRoutes from './routes/customerRoutes';
import lorryReceiptRoutes from './routes/lorryReceiptRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import paymentRoutes from './routes/paymentRoutes';
import dataRoutes from './routes/dataRoutes';
import truckHiringNoteRoutes from './routes/truckHiringNoteRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import simpleNumberingRoutes from './routes/simpleNumberingRoutes';
import companyInfoRoutes from './routes/companyInfoRoutes';
import bankAccountRoutes from './routes/bankAccountRoutes';
import apiKeyRoutes from './routes/apiKeyRoutes';

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = Array.isArray(config.corsOrigin) 
      ? config.corsOrigin 
      : [config.corsOrigin];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// Serve static files from the React app build directory
const frontendPath = path.join(__dirname, '../../dist');
app.use(express.static(frontendPath));

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/lorryreceipts', lorryReceiptRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/truckhiringnotes', truckHiringNoteRoutes);
app.use('/api/numbering', simpleNumberingRoutes);
app.use('/api/company-info', companyInfoRoutes);
app.use('/api/bank-accounts', bankAccountRoutes);
app.use('/api/api-keys', apiKeyRoutes);

// Health check endpoint (must be before catch-all)
app.get('/health', (req: express.Request, res: express.Response) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API status endpoint
app.get('/', (req: express.Request, res: express.Response) => {
  res.send('API is running...');
});

// Catch all handler: send back React's index.html file for any non-API routes
app.use((req: express.Request, res: express.Response) => {
  // Only serve index.html for non-API routes
  if (!req.path.startsWith('/api/') && req.path !== '/health') {
    res.sendFile(path.join(frontendPath, 'index.html'));
  } else {
    res.status(404).json({ message: 'API route not found' });
  }
});

// Start server
app.listen(config.port, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${config.port}`);
  console.log(`📊 Health check available at http://0.0.0.0:${config.port}/health`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
});
