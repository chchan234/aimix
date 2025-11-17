// Load environment variables FIRST (before any other imports)
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try multiple locations for .env file
const envPaths = [
  path.resolve(__dirname, '../.env'),        // server/.env
  path.resolve(process.cwd(), '.env'),        // current working directory
  path.resolve(__dirname, '../../.env'),      // parent directory
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    console.log(`📄 Loading environment from: ${envPath}`);
    dotenv.config({ path: envPath, override: true });
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn('⚠️  No .env file found, using environment variables');
  dotenv.config({ override: true }); // Fall back to default behavior
}

// Now import everything else
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { supabase, testConnection } from './db/supabase.js';
import { authenticateToken } from './middleware/auth.js';
import aiRoutes from './routes/ai.js';
import authRoutes from './routes/auth.js';

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
  if (!process.env.SUPABASE_SERVICE_KEY) {
    errors.push('SUPABASE_SERVICE_KEY environment variable is required for server');
  }

  // AI API Keys - at least one must be configured
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasGemini = !!process.env.GEMINI_API_KEY;

  if (!hasOpenAI && !hasGemini) {
    errors.push('At least one AI API key (OPENAI_API_KEY or GEMINI_API_KEY) is required');
  }

  // Kakao OAuth (optional but recommended)
  if (!process.env.KAKAO_REST_API_KEY) {
    console.warn('⚠️  KAKAO_REST_API_KEY not configured - Kakao login will be disabled');
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
app.use(cookieParser());

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

// Test endpoint to get user count (requires authentication)
app.get('/api/users/count', authenticateToken, async (req, res) => {
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

// Global error handler (must be after all routes)
import { globalErrorHandler } from './middleware/error-handler.js';
app.use(globalErrorHandler);

// Export for Vercel serverless
export default app;
