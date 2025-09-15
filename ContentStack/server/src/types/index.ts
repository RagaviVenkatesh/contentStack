// Server-side types for the Locale Variants App

export interface Locale {
  code: string;
  name: string;
  fallback?: string[];
  isDefault?: boolean;
  variantParam?: string;
}

export interface VariantGroup {
  id: string;
  name: string;
  description?: string;
  locales: Locale[];
  createdAt: string;
  updatedAt: string;
}

export interface VariantConfig {
  id: string;
  groupId: string;
  entryUid: string;
  contentTypeUid: string;
  locale: string;
  variantParam: string;
  content: Record<string, any>;
  fallbackChain: string[];
  isTranslated: boolean;
  lastModified: string;
}

export interface TranslationRequest {
  sourceLocale: string;
  targetLocale: string;
  content: Record<string, any>;
  contentTypeUid: string;
  useAI?: boolean;
  aiProvider?: 'openai' | 'groq' | 'google' | 'deepl';
}

export interface TranslationResponse {
  translatedContent: Record<string, any>;
  confidence?: number;
  method: 'manual' | 'ai' | 'fallback';
  timestamp: string;
  provider?: string;
}

export interface EntryVariant {
  locale: string;
  variantParam: string;
  content: Record<string, any>;
  isComplete: boolean;
  missingFields: string[];
  fallbackUsed: string[];
  lastModified: string;
}

export interface BulkVariantRequest {
  contentTypeUid: string;
  entryUids: string[];
  variantGroupId: string;
  locales: string[];
  generateTranslations?: boolean;
  aiProvider?: 'openai' | 'groq' | 'google' | 'deepl';
}

export interface ContentstackEntry {
  uid: string;
  title: string;
  contentTypeUid: string;
  locale: string;
  content: Record<string, any>;
  publishDetails?: {
    environment: string;
    locale: string;
    time: string;
  };
}

export interface FallbackResult {
  content: Record<string, any>;
  usedFallback: string[];
  missingFields: string[];
  confidence: number;
}

export interface AITranslationConfig {
  provider: 'openai' | 'groq' | 'google' | 'deepl';
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface VectorSearchResult {
  content: Record<string, any>;
  similarity: number;
  metadata: Record<string, any>;
}

export interface EmbeddingConfig {
  provider: 'openai' | 'google';
  model: string;
  dimensions?: number;
}

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  contentstack: {
    apiKey: string;
    deliveryToken: string;
    managementToken: string;
    environment: string;
    region: string;
  };
  personalize: {
    apiKey: string;
    projectId: string;
  };
  ai: {
    openai: {
      apiKey: string;
      model?: string;
    };
    groq: {
      apiKey: string;
      model?: string;
    };
    google: {
      apiKey: string;
      model?: string;
    };
    deepl: {
      apiKey: string;
    };
  };
  vector: {
    pinecone?: {
      apiKey: string;
      environment: string;
    };
  };
  security: {
    jwtSecret: string;
    corsOrigin: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  query?: string;
  locale?: string;
  contentTypeUid?: string;
  variantGroupId?: string;
}

export interface WebhookPayload {
  event: string;
  data: {
    entry: ContentstackEntry;
    contentType: any;
    environment: string;
  };
  timestamp: string;
}

export interface AgentConfig {
  name: string;
  description: string;
  tools: string[];
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

export interface AgentResponse {
  action: string;
  parameters: Record<string, any>;
  result: any;
  confidence: number;
  reasoning: string;
}
