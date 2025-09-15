import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { APIResponse } from '@/types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse<APIResponse>) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Generic API methods
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.api.get<APIResponse<T>>(url, { params });
    return response.data.data as T;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.post<APIResponse<T>>(url, data);
    return response.data.data as T;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.put<APIResponse<T>>(url, data);
    return response.data.data as T;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.api.delete<APIResponse<T>>(url);
    return response.data.data as T;
  }

  // Variant Groups API
  async getVariantGroups() {
    return this.get('/variants/groups');
  }

  async getVariantGroup(id: string) {
    return this.get(`/variants/groups/${id}`);
  }

  async createVariantGroup(data: any) {
    return this.post('/variants/groups', data);
  }

  async updateVariantGroup(id: string, data: any) {
    return this.put(`/variants/groups/${id}`, data);
  }

  async deleteVariantGroup(id: string) {
    return this.delete(`/variants/groups/${id}`);
  }

  // Variant Configs API
  async getVariantConfigs(entryUid: string, contentTypeUid: string) {
    return this.get(`/variants/configs/${entryUid}/${contentTypeUid}`);
  }

  async createBulkVariants(data: any) {
    return this.post('/variants/bulk', data);
  }

  async resolveFallback(entryUid: string, contentTypeUid: string, locale: string, variantGroupId: string) {
    return this.get(`/variants/fallback/${entryUid}/${contentTypeUid}/${locale}/${variantGroupId}`);
  }

  // Translation API
  async translateContent(data: any) {
    return this.post('/translations/translate', data);
  }

  async translateBatch(data: any) {
    return this.post('/translations/batch', data);
  }

  async detectLanguage(data: any) {
    return this.post('/translations/detect-language', data);
  }

  async getTranslationProviders() {
    return this.get('/translations/providers');
  }

  async getSupportedLanguages() {
    return this.get('/translations/supported-languages');
  }

  // Contentstack API
  async getContentTypes() {
    return this.get('/contentstack/content-types');
  }

  async getContentType(uid: string) {
    return this.get(`/contentstack/content-types/${uid}`);
  }

  async getLocales() {
    return this.get('/contentstack/locales');
  }

  async getEntries(contentTypeUid: string, locale?: string) {
    return this.get(`/contentstack/entries/${contentTypeUid}`, { locale });
  }

  async getEntry(contentTypeUid: string, uid: string, locale?: string) {
    return this.get(`/contentstack/entries/${contentTypeUid}/${uid}`, { locale });
  }

  async updateEntry(contentTypeUid: string, uid: string, data: any) {
    return this.put(`/contentstack/entries/${contentTypeUid}/${uid}`, data);
  }

  async createEntry(contentTypeUid: string, data: any) {
    return this.post(`/contentstack/entries/${contentTypeUid}`, data);
  }

  async publishEntry(contentTypeUid: string, uid: string, locale?: string) {
    return this.post(`/contentstack/entries/${contentTypeUid}/${uid}/publish`, { locale });
  }

  async searchEntries(contentTypeUid: string, data: any) {
    return this.post(`/contentstack/search/${contentTypeUid}`, data);
  }

  // Health check
  async healthCheck() {
    return this.get('/health');
  }
}

export const apiService = new ApiService();
export default apiService;
