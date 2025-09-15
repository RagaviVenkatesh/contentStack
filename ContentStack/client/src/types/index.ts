// Frontend types for the Locale Variants App

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

export interface TranslationProvider {
  id: string;
  name: string;
  models: string[];
  features: string[];
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
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

export interface VariantManagerState {
  variantGroups: VariantGroup[];
  currentGroup?: VariantGroup;
  entries: ContentstackEntry[];
  selectedEntry?: ContentstackEntry;
  variants: EntryVariant[];
  loading: boolean;
  error?: string;
}

export interface AppConfig {
  apiBaseUrl: string;
  contentstack: {
    apiKey: string;
    deliveryToken: string;
    environment: string;
    region: string;
  };
}

export interface DragItem {
  id: string;
  type: 'locale';
  index: number;
}

export interface DropResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  };
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  details?: any;
}
