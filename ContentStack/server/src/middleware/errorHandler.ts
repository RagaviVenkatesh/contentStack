import { Request, Response, NextFunction } from 'express';
import { APIResponse } from '@/types';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);

  // Default error response
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: any = undefined;

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    details = error.details;
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Forbidden';
  } else if (error.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Not Found';
  } else if (error.name === 'ConflictError') {
    statusCode = 409;
    message = 'Conflict';
  } else if (error.name === 'RateLimitError') {
    statusCode = 429;
    message = 'Too Many Requests';
  } else if (error.statusCode) {
    statusCode = error.statusCode;
    message = error.message;
  }

  // Log error details
  console.error(`Error ${statusCode}: ${message}`, {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    error: error.stack,
  });

  const response: APIResponse = {
    success: false,
    error: message,
    message: error.message || message,
    timestamp: new Date().toISOString(),
  };

  if (details) {
    response.data = details;
  }

  // Include error details in development
  if (process.env.NODE_ENV === 'development') {
    response.data = {
      ...response.data,
      stack: error.stack,
      details: error.details,
    };
  }

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const response: APIResponse = {
    success: false,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  };

  res.status(404).json(response);
};
