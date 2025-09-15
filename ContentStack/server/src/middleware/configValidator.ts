import { Request, Response, NextFunction } from 'express';
import { APIResponse } from '@/types';

export const validateConfig = (req: Request, res: Response, next: NextFunction): void => {
  const requiredEnvVars = [
    'CONTENTSTACK_API_KEY',
    'CONTENTSTACK_MANAGEMENT_TOKEN',
    'PERSONALIZE_API_KEY',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    const response: APIResponse = {
      success: false,
      error: 'Configuration Error',
      message: `Missing required environment variables: ${missingVars.join(', ')}`,
      timestamp: new Date().toISOString(),
    };

    console.error('❌ Configuration validation failed:', missingVars);
    res.status(500).json(response);
    return;
  }

  // Log successful configuration validation
  console.log('✅ Configuration validated successfully');
  next();
};
