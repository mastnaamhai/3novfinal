import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  mongodbUri: string;
  corsOrigin: string | string[];
  jwtSecret: string;
  appPasswordHash: string;
  gstinApiKey: string;
}

const config: Config = {
  port: parseInt(process.env.PORT || '8080', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || '',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || '',
  appPasswordHash: process.env.APP_PASSWORD_HASH || '',
  gstinApiKey: process.env.VITE_GSTIN_API_KEY || ''
};

// Validate required environment variables in production
if (config.nodeEnv === 'production') {
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET', 'APP_PASSWORD_HASH'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

// Parse CORS origin if it's a comma-separated string
if (typeof config.corsOrigin === 'string' && config.corsOrigin.includes(',')) {
  config.corsOrigin = config.corsOrigin.split(',').map(origin => origin.trim());
}

export default config;