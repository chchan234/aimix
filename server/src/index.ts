import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase, testConnection } from './db/supabase.js';
import aiRoutes from './routes/ai.js';
import authRoutes from './routes/auth.js';

dotenv.config();

// Security: Validate critical environment variables
function validateEnvironment() {
  const errors: string[] = [];

  // JWT_SECRET is critical for security
  if (!process.env.JWT_SECRET) {
    errors.push('JWT_SECRET environment variable is required');
  } else if (process.env.JWT_SECRET === 'your-secret-key-change-this') {
    errors.push('JWT_SECRET must not use the default value');
  } else if (process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long');
  }

  // Other critical environment variables
  if (!process.env.SUPABASE_URL) {
    errors.push('SUPABASE_URL environment variable is required');
  }
  if (!process.env.SUPABASE_ANON_KEY) {
    errors.push('SUPABASE_ANON_KEY environment variable is required');
  }

  if (errors.length > 0) {
    console.error('❌ CRITICAL: Server cannot start due to missing or invalid environment variables:');
    errors.forEach(error => console.error(`  - ${error}`));
    console.error('\n💡 Set these environment variables before starting the server.');
    process.exit(1);
  }

  console.log('✅ Environment validation passed');
}

// Validate environment before starting server
validateEnvironment();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'https://aiports.org',
  'https://www.aiports.org',
  process.env.CLIENT_URL
].filter(Boolean);

// CORS configuration for Vercel serverless
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Explicit OPTIONS handling for Vercel serverless
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check with DB connection test
app.get('/health', async (req, res) => {
  try {
    // Test database connection with Supabase
    const connectionTest = await testConnection();

    if (connectionTest.success) {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
        message: connectionTest.message
      });
    } else {
      res.status(500).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: connectionTest.message
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API routes
app.get('/api', (req, res) => {
  res.json({
    message: 'AI Platform API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: {
        register: '/api/auth/register',
        login: '/api/auth/login',
        kakao: '/api/auth/kakao',
        me: '/api/auth/me',
        logout: '/api/auth/logout'
      },
      users: '/api/users',
      ai: {
        faceReading: '/api/ai/face-reading',
        nameAnalysis: '/api/ai/name-analysis',
        dreamInterpretation: '/api/ai/dream-interpretation',
        story: '/api/ai/story',
        chat: '/api/ai/chat'
      }
    }
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// AI service routes
app.use('/api/ai', aiRoutes);

// Test endpoint to get user count
app.get('/api/users/count', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    res.json({ count: count || 0 });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to count users'
    });
  }
});

// Start server (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Export for Vercel serverless
export default app;
