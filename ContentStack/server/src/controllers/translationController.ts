import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { TranslationService } from '../services/translation';
import { APIResponse, TranslationRequest, AITranslationConfig } from '../types';

const router = Router();

// Initialize translation service with mock config for development
const translationService = new TranslationService({
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  contentstack: {
    apiKey: process.env.CONTENTSTACK_API_KEY || 'mock-api-key',
    deliveryToken: process.env.CONTENTSTACK_DELIVERY_TOKEN || 'mock-delivery-token',
    managementToken: process.env.CONTENTSTACK_MANAGEMENT_TOKEN || 'mock-management-token',
    environment: process.env.CONTENTSTACK_ENVIRONMENT || 'development',
    region: process.env.CONTENTSTACK_REGION || 'us',
  },
  personalize: {
    apiKey: process.env.PERSONALIZE_API_KEY || 'mock-personalize-key',
    projectId: process.env.PERSONALIZE_PROJECT_ID || 'mock-project-id',
  },
  ai: {
    openai: { apiKey: process.env.OPENAI_API_KEY || '' },
    groq: { apiKey: process.env.GROQ_API_KEY || '' },
    google: { apiKey: process.env.GOOGLE_TRANSLATE_API_KEY || '' },
    deepl: { apiKey: process.env.DEEPL_API_KEY || '' },
  },
  vector: {
    pinecone: process.env.PINECONE_API_KEY ? {
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT || '',
    } : undefined,
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || 'default-secret',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
});

// Validation schemas
const translationRequestSchema = Joi.object({
  sourceLocale: Joi.string().required().min(2).max(10),
  targetLocale: Joi.string().required().min(2).max(10),
  content: Joi.object().required(),
  contentTypeUid: Joi.string().required(),
  useAI: Joi.boolean().optional(),
  aiProvider: Joi.string().valid('openai', 'groq', 'google', 'deepl').optional(),
});

const batchTranslationSchema = Joi.object({
  requests: Joi.array().items(translationRequestSchema).required().min(1).max(10),
  aiConfig: Joi.object({
    provider: Joi.string().valid('openai', 'groq', 'google', 'deepl').required(),
    model: Joi.string().optional(),
    temperature: Joi.number().min(0).max(2).optional(),
    maxTokens: Joi.number().min(1).max(4000).optional(),
  }).optional(),
});

const languageDetectionSchema = Joi.object({
  text: Joi.string().required().min(1).max(10000),
});

// Routes

// POST /api/translations/translate - Translate content
router.post('/translate', async (req: Request, res: Response) => {
  try {
    const { error, value } = translationRequestSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: error.details[0].message,
        timestamp: new Date().toISOString(),
      });
    }

    const aiConfig: AITranslationConfig = {
      provider: value.aiProvider || 'openai',
      model: value.aiProvider === 'groq' ? 'llama3-8b-8192' : 'gpt-3.5-turbo',
      temperature: 0.3,
      maxTokens: 2000,
    };

    const result = await translationService.translateContent(value, aiConfig);
    
    const response: APIResponse = {
      success: true,
      data: result,
      message: 'Translation completed successfully',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error translating content:', error);
    res.status(500).json({
      success: false,
      error: 'Translation failed',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/translations/batch - Batch translate content
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { error, value } = batchTranslationSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: error.details[0].message,
        timestamp: new Date().toISOString(),
      });
    }

    const aiConfig: AITranslationConfig = value.aiConfig || {
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      temperature: 0.3,
      maxTokens: 2000,
    };

    const results = await translationService.translateBatch(value.requests, aiConfig);
    
    const response: APIResponse = {
      success: true,
      data: results,
      message: `Batch translation completed: ${results.length} translations`,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error in batch translation:', error);
    res.status(500).json({
      success: false,
      error: 'Batch translation failed',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/translations/detect-language - Detect language
router.post('/detect-language', async (req: Request, res: Response) => {
  try {
    const { error, value } = languageDetectionSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: error.details[0].message,
        timestamp: new Date().toISOString(),
      });
    }

    const detectedLanguage = await translationService.detectLanguage(value.text);
    
    const response: APIResponse = {
      success: true,
      data: { language: detectedLanguage },
      message: 'Language detection completed',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error detecting language:', error);
    res.status(500).json({
      success: false,
      error: 'Language detection failed',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/translations/providers - Get available translation providers
router.get('/providers', async (req: Request, res: Response) => {
  try {
    const providers = [];
    
    if (process.env.OPENAI_API_KEY) {
      providers.push({
        id: 'openai',
        name: 'OpenAI GPT',
        models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
        features: ['high-quality', 'context-aware', 'multiple-languages'],
      });
    }
    
    if (process.env.GROQ_API_KEY) {
      providers.push({
        id: 'groq',
        name: 'Groq (Llama)',
        models: ['llama3-8b-8192', 'llama3-70b-8192'],
        features: ['fast', 'cost-effective', 'open-source'],
      });
    }
    
    if (process.env.GOOGLE_TRANSLATE_API_KEY) {
      providers.push({
        id: 'google',
        name: 'Google Translate',
        models: ['google-translate'],
        features: ['100+ languages', 'reliable', 'fast'],
      });
    }
    
    if (process.env.DEEPL_API_KEY) {
      providers.push({
        id: 'deepl',
        name: 'DeepL',
        models: ['deepl-translate'],
        features: ['high-quality', 'european-languages', 'context-aware'],
      });
    }
    
    const response: APIResponse = {
      success: true,
      data: providers,
      message: `Found ${providers.length} translation providers`,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching providers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch translation providers',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/translations/supported-languages - Get supported languages
router.get('/supported-languages', async (req: Request, res: Response) => {
  try {
    const languages = [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' },
      { code: 'fr', name: 'French', nativeName: 'Français' },
      { code: 'de', name: 'German', nativeName: 'Deutsch' },
      { code: 'it', name: 'Italian', nativeName: 'Italiano' },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
      { code: 'ru', name: 'Russian', nativeName: 'Русский' },
      { code: 'zh', name: 'Chinese', nativeName: '中文' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語' },
      { code: 'ko', name: 'Korean', nativeName: '한국어' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
      { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
      { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
      { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
      { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
      { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
      { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
      { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    ];
    
    const response: APIResponse = {
      success: true,
      data: languages,
      message: `Found ${languages.length} supported languages`,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching supported languages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch supported languages',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
