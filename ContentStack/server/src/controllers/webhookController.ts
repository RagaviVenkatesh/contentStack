import { Router, Request, Response } from 'express';
import { ContentstackService } from '../services/contentstack';
import { APIResponse, WebhookPayload } from '../types';

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

// POST /api/webhooks/contentstack - Handle Contentstack webhooks
router.post('/contentstack', async (req: Request, res: Response) => {
  try {
    const payload: WebhookPayload = req.body;
    
    console.log('📨 Webhook received:', {
      event: payload.event,
      entryUid: payload.data.entry.uid,
      contentTypeUid: payload.data.entry.contentTypeUid,
      timestamp: payload.timestamp,
    });

    // Process the webhook
    await contentstackService.processWebhook(payload);
    
    const response: APIResponse = {
      success: true,
      message: 'Webhook processed successfully',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Webhook processing failed',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/webhooks/test - Test webhook endpoint
router.get('/test', async (req: Request, res: Response) => {
  try {
    const testPayload: WebhookPayload = {
      event: 'entry.publish',
      data: {
        entry: {
          uid: 'test-entry-uid',
          title: 'Test Entry',
          contentTypeUid: 'test-content-type',
          locale: 'en-us',
          content: { title: 'Test Content' },
        },
        contentType: {
          uid: 'test-content-type',
          title: 'Test Content Type',
        },
        environment: 'development',
      },
      timestamp: new Date().toISOString(),
    };

    await contentstackService.processWebhook(testPayload);
    
    const response: APIResponse = {
      success: true,
      message: 'Test webhook processed successfully',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error processing test webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Test webhook processing failed',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
