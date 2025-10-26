const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const profileRoutes = require('./routes/profiles');
const jobRoutes = require('./routes/jobs');
const verificationRoutes = require('./routes/verification');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration - MUST come before body parsers
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing middleware - MUST come after CORS
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

app.use(limiter);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const concordiumService = require('./services/concordiumService');
    const networkInfo = await concordiumService.getNetworkInfo();
    
    res.json({
      success: true,
      message: 'ProofOfWork API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      concordium: networkInfo
    });
  } catch (error) {
    res.json({
      success: true,
      message: 'ProofOfWork API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      concordium: { error: 'Connection failed' }
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ProofOfWork Location-Verified Payment Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      profiles: '/api/v1/profiles',
      jobs: '/api/v1/jobs',
      verification: '/api/verify-location'
    },
    database: 'Supabase',
    blockchain: process.env.CONCORDIUM_NODE_URL?.includes('localhost') ? 'Concordium P9 Localnet' : 'Concordium'
  });
});

// API routes
app.use('/api/v1/profiles', profileRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api', verificationRoutes);  // This handles /api/verify-location

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 ProofOfWork API server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api/v1`);
    console.log(`🗄️  Database: Supabase`);
    console.log(`⛓️  Blockchain: Concordium ${process.env.CONCORDIUM_NODE_URL}`);
  });
}

module.exports = app;