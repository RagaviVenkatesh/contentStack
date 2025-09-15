// Core types for the Locale Variants App

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
}

export interface TranslationResponse {
  translatedContent: Record<string, any>;
  confidence?: number;
  method: 'manual' | 'ai' | 'fallback';
  timestamp: string;
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
}

export interface AppConfig {
  stackApiKey: string;
  managementToken: string;
  personalizeApiKey: string;
  translationApiKey?: string;
  translationService?: 'google' | 'deepl' | 'azure';
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

export interface PersonalizeVariant {
  id: string;
  name: string;
  attributes: Record<string, any>;
  experiences: any[];
  audiences: any[];
}

export interface FallbackResult {
  content: Record<string, any>;
  usedFallback: string[];
  missingFields: string[];
  confidence: number;
}

export interface VariantManagerState {
  variantGroups: VariantGroup[];
  currentGroup?: VariantGroup;
  entries: ContentstackEntry[];
  selectedEntry?: ContentstackEntry;
  variants: EntryVariant[];
  loading: boolean;
  error?: string;
}

export interface TranslationService {
  translate: (text: string, from: string, to: string) => Promise<string>;
  translateObject: (obj: Record<string, any>, from: string, to: string) => Promise<Record<string, any>>;
  detectLanguage: (text: string) => Promise<string>;
}
