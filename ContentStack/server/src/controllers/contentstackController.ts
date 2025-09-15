import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { ContentstackService } from '../services/contentstack';
import { APIResponse, ContentstackEntry } from '../types';

const router = Router();

// Initialize contentstack service
const contentstackService = new ContentstackService({
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  contentstack: {
    apiKey: process.env.CONTENTSTACK_API_KEY!,
    deliveryToken: process.env.CONTENTSTACK_DELIVERY_TOKEN!,
    managementToken: process.env.CONTENTSTACK_MANAGEMENT_TOKEN!,
    environment: process.env.CONTENTSTACK_ENVIRONMENT || 'development',
    region: process.env.CONTENTSTACK_REGION || 'us',
  },
  personalize: {
    apiKey: process.env.PERSONALIZE_API_KEY!,
    projectId: process.env.PERSONALIZE_PROJECT_ID!,
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
const entryUpdateSchema = Joi.object({
  content: Joi.object().required(),
  locale: Joi.string().optional().default('en-us'),
});

const entryCreateSchema = Joi.object({
  content: Joi.object().required(),
  locale: Joi.string().optional().default('en-us'),
});

const searchSchema = Joi.object({
  query: Joi.string().required().min(1),
  locale: Joi.string().optional().default('en-us'),
  limit: Joi.number().optional().min(1).max(100).default(10),
});

// Routes

// GET /api/contentstack/content-types - Get all content types
router.get('/content-types', async (req: Request, res: Response) => {
  try {
    const contentTypes = await contentstackService.getContentTypes();
    
    const response: APIResponse = {
      success: true,
      data: contentTypes,
      message: `Found ${contentTypes.length} content types`,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching content types:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch content types',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/contentstack/content-types/:uid - Get specific content type
router.get('/content-types/:uid', async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const contentType = await contentstackService.getContentType(uid);
    
    const response: APIResponse = {
      success: true,
      data: contentType,
      message: 'Content type retrieved successfully',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching content type:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch content type',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/contentstack/locales - Get all locales
router.get('/locales', async (req: Request, res: Response) => {
  try {
    const locales = await contentstackService.getLocales();
    
    const response: APIResponse = {
      success: true,
      data: locales,
      message: `Found ${locales.length} locales`,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching locales:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch locales',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/contentstack/entries/:contentTypeUid - Get entries for content type
router.get('/entries/:contentTypeUid', async (req: Request, res: Response) => {
  try {
    const { contentTypeUid } = req.params;
    const { locale = 'en-us' } = req.query;
    
    const entries = await contentstackService.getEntries(contentTypeUid, locale as string);
    
    const response: APIResponse<ContentstackEntry[]> = {
      success: true,
      data: entries,
      message: `Found ${entries.length} entries`,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching entries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch entries',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/contentstack/entries/:contentTypeUid/:uid - Get specific entry
router.get('/entries/:contentTypeUid/:uid', async (req: Request, res: Response) => {
  try {
    const { contentTypeUid, uid } = req.params;
    const { locale = 'en-us' } = req.query;
    
    const entry = await contentstackService.getEntry(uid, contentTypeUid, locale as string);
    
    const response: APIResponse<ContentstackEntry> = {
      success: true,
      data: entry,
      message: 'Entry retrieved successfully',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch entry',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// PUT /api/contentstack/entries/:contentTypeUid/:uid - Update entry
router.put('/entries/:contentTypeUid/:uid', async (req: Request, res: Response) => {
  try {
    const { contentTypeUid, uid } = req.params;
    const { error, value } = entryUpdateSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: error.details[0].message,
        timestamp: new Date().toISOString(),
      });
    }

    const entry = await contentstackService.updateEntry(uid, contentTypeUid, value.content, value.locale);
    
    const response: APIResponse<ContentstackEntry> = {
      success: true,
      data: entry,
      message: 'Entry updated successfully',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error updating entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update entry',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/contentstack/entries/:contentTypeUid - Create entry
router.post('/entries/:contentTypeUid', async (req: Request, res: Response) => {
  try {
    const { contentTypeUid } = req.params;
    const { error, value } = entryCreateSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: error.details[0].message,
        timestamp: new Date().toISOString(),
      });
    }

    const entry = await contentstackService.createEntry(contentTypeUid, value.content, value.locale);
    
    const response: APIResponse<ContentstackEntry> = {
      success: true,
      data: entry,
      message: 'Entry created successfully',
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Error creating entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create entry',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/contentstack/entries/:contentTypeUid/:uid/publish - Publish entry
router.post('/entries/:contentTypeUid/:uid/publish', async (req: Request, res: Response) => {
  try {
    const { contentTypeUid, uid } = req.params;
    const { locale = 'en-us' } = req.body;
    
    await contentstackService.publishEntry(uid, contentTypeUid, locale);
    
    const response: APIResponse = {
      success: true,
      message: 'Entry published successfully',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error publishing entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to publish entry',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/contentstack/search/:contentTypeUid - Search entries
router.post('/search/:contentTypeUid', async (req: Request, res: Response) => {
  try {
    const { contentTypeUid } = req.params;
    const { error, value } = searchSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: error.details[0].message,
        timestamp: new Date().toISOString(),
      });
    }

    const entries = await contentstackService.searchEntries(
      contentTypeUid,
      value.query,
      value.locale,
      value.limit
    );
    
    const response: APIResponse<ContentstackEntry[]> = {
      success: true,
      data: entries,
      message: `Found ${entries.length} matching entries`,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error searching entries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search entries',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
