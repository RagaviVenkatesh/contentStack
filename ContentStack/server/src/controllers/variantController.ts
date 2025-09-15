import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { PersonalizeService } from '../services/personalize';
import { ContentstackService } from '../services/contentstack';
import { APIResponse, VariantGroup, BulkVariantRequest, VariantConfig } from '../types';

const router = Router();

// Initialize services
const personalizeService = new PersonalizeService({
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
const variantGroupSchema = Joi.object({
  name: Joi.string().required().min(1).max(100),
  description: Joi.string().optional().max(500),
  locales: Joi.array().items(
    Joi.object({
      code: Joi.string().required().min(2).max(10),
      name: Joi.string().required().min(1).max(50),
      fallback: Joi.array().items(Joi.string()).optional(),
      isDefault: Joi.boolean().optional(),
    })
  ).required().min(1),
});

const bulkVariantSchema = Joi.object({
  contentTypeUid: Joi.string().required(),
  entryUids: Joi.array().items(Joi.string()).required().min(1),
  variantGroupId: Joi.string().required(),
  locales: Joi.array().items(Joi.string()).required().min(1),
  generateTranslations: Joi.boolean().optional(),
  aiProvider: Joi.string().valid('openai', 'groq', 'google', 'deepl').optional(),
});

// Routes

// GET /api/variants/groups - Get all variant groups
router.get('/groups', async (req: Request, res: Response) => {
  try {
    const groups = await personalizeService.getVariantGroups();
    
    const response: APIResponse<VariantGroup[]> = {
      success: true,
      data: groups,
      message: `Found ${groups.length} variant groups`,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching variant groups:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch variant groups',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/variants/groups/:id - Get specific variant group
router.get('/groups/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const group = await personalizeService.getVariantGroup(id);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Variant group not found',
        message: `No variant group found with ID: ${id}`,
        timestamp: new Date().toISOString(),
      });
    }

    const response: APIResponse<VariantGroup> = {
      success: true,
      data: group,
      message: 'Variant group retrieved successfully',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching variant group:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch variant group',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/variants/groups - Create new variant group
router.post('/groups', async (req: Request, res: Response) => {
  try {
    const { error, value } = variantGroupSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: error.details[0].message,
        timestamp: new Date().toISOString(),
      });
    }

    const group = await personalizeService.createVariantGroup(value);
    
    const response: APIResponse<VariantGroup> = {
      success: true,
      data: group,
      message: 'Variant group created successfully',
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Error creating variant group:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create variant group',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// PUT /api/variants/groups/:id - Update variant group
router.put('/groups/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = variantGroupSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: error.details[0].message,
        timestamp: new Date().toISOString(),
      });
    }

    const group = await personalizeService.updateVariantGroup(id, value);
    
    const response: APIResponse<VariantGroup> = {
      success: true,
      data: group,
      message: 'Variant group updated successfully',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error updating variant group:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update variant group',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// DELETE /api/variants/groups/:id - Delete variant group
router.delete('/groups/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await personalizeService.deleteVariantGroup(id);
    
    const response: APIResponse = {
      success: true,
      message: 'Variant group deleted successfully',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error deleting variant group:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete variant group',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/variants/configs/:entryUid/:contentTypeUid - Get variant configs for entry
router.get('/configs/:entryUid/:contentTypeUid', async (req: Request, res: Response) => {
  try {
    const { entryUid, contentTypeUid } = req.params;
    const configs = await personalizeService.getVariantConfigs(entryUid, contentTypeUid);
    
    const response: APIResponse<VariantConfig[]> = {
      success: true,
      data: configs,
      message: `Found ${configs.length} variant configurations`,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching variant configs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch variant configurations',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/variants/bulk - Create bulk variants
router.post('/bulk', async (req: Request, res: Response) => {
  try {
    const { error, value } = bulkVariantSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: error.details[0].message,
        timestamp: new Date().toISOString(),
      });
    }

    const configs = await personalizeService.createBulkVariants(
      value.entryUids,
      value.contentTypeUid,
      value.variantGroupId,
      value.locales
    );
    
    const response: APIResponse<VariantConfig[]> = {
      success: true,
      data: configs,
      message: `Created ${configs.length} variant configurations`,
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Error creating bulk variants:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create bulk variants',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/variants/fallback/:entryUid/:contentTypeUid/:locale/:variantGroupId - Resolve fallback
router.get('/fallback/:entryUid/:contentTypeUid/:locale/:variantGroupId', async (req: Request, res: Response) => {
  try {
    const { entryUid, contentTypeUid, locale, variantGroupId } = req.params;
    
    const result = await personalizeService.resolveFallback(
      entryUid,
      contentTypeUid,
      locale,
      variantGroupId
    );
    
    const response: APIResponse = {
      success: true,
      data: result,
      message: 'Fallback resolved successfully',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error resolving fallback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resolve fallback',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
