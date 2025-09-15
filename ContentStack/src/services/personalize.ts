import { PersonalizeClient } from '@contentstack/personalize-sdk';
import { 
  VariantGroup, 
  Locale, 
  VariantConfig, 
  PersonalizeVariant, 
  FallbackResult,
  AppConfig 
} from '@/types';

export class PersonalizeService {
  private client: PersonalizeClient;
  private config: AppConfig;

  constructor(config: AppConfig) {
    this.config = config;
    this.client = new PersonalizeClient({
      api_key: config.personalizeApiKey,
      project_id: config.personalizeApiKey, // Will be updated with actual project ID
    });
  }

  // Variant Group Management
  async createVariantGroup(group: Omit<VariantGroup, 'id' | 'createdAt' | 'updatedAt'>): Promise<VariantGroup> {
    try {
      const variantGroup: VariantGroup = {
        ...group,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store in Personalize as a custom resource
      await this.client.resource('variant_groups').create(variantGroup);
      
      return variantGroup;
    } catch (error) {
      console.error('Error creating variant group:', error);
      throw new Error(`Failed to create variant group: ${error.message}`);
    }
  }

  async getVariantGroups(): Promise<VariantGroup[]> {
    try {
      const response = await this.client.resource('variant_groups').query().find();
      return response.items || [];
    } catch (error) {
      console.error('Error fetching variant groups:', error);
      throw new Error(`Failed to fetch variant groups: ${error.message}`);
    }
  }

  async getVariantGroup(id: string): Promise<VariantGroup | null> {
    try {
      const group = await this.client.resource('variant_groups').find(id);
      return group || null;
    } catch (error) {
      console.error('Error fetching variant group:', error);
      throw new Error(`Failed to fetch variant group ${id}: ${error.message}`);
    }
  }

  async updateVariantGroup(id: string, updates: Partial<VariantGroup>): Promise<VariantGroup> {
    try {
      const updatedGroup = await this.client.resource('variant_groups').update(id, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      
      return updatedGroup;
    } catch (error) {
      console.error('Error updating variant group:', error);
      throw new Error(`Failed to update variant group ${id}: ${error.message}`);
    }
  }

  async deleteVariantGroup(id: string): Promise<void> {
    try {
      await this.client.resource('variant_groups').delete(id);
    } catch (error) {
      console.error('Error deleting variant group:', error);
      throw new Error(`Failed to delete variant group ${id}: ${error.message}`);
    }
  }

  // Variant Configuration Management
  async createVariantConfig(config: Omit<VariantConfig, 'lastModified'>): Promise<VariantConfig> {
    try {
      const variantConfig: VariantConfig = {
        ...config,
        lastModified: new Date().toISOString(),
      };

      await this.client.resource('variant_configs').create(variantConfig);
      
      return variantConfig;
    } catch (error) {
      console.error('Error creating variant config:', error);
      throw new Error(`Failed to create variant config: ${error.message}`);
    }
  }

  async getVariantConfigs(entryUid: string, contentTypeUid: string): Promise<VariantConfig[]> {
    try {
      const response = await this.client.resource('variant_configs')
        .query()
        .where('entryUid', entryUid)
        .where('contentTypeUid', contentTypeUid)
        .find();
      
      return response.items || [];
    } catch (error) {
      console.error('Error fetching variant configs:', error);
      throw new Error(`Failed to fetch variant configs: ${error.message}`);
    }
  }

  async updateVariantConfig(
    entryUid: string, 
    contentTypeUid: string, 
    locale: string, 
    updates: Partial<VariantConfig>
  ): Promise<VariantConfig> {
    try {
      const configs = await this.getVariantConfigs(entryUid, contentTypeUid);
      const config = configs.find(c => c.locale === locale);
      
      if (!config) {
        throw new Error(`Variant config not found for locale ${locale}`);
      }

      const updatedConfig = await this.client.resource('variant_configs').update(config.id, {
        ...updates,
        lastModified: new Date().toISOString(),
      });
      
      return updatedConfig;
    } catch (error) {
      console.error('Error updating variant config:', error);
      throw new Error(`Failed to update variant config: ${error.message}`);
    }
  }

  // Fallback Logic Implementation
  async resolveFallback(
    entryUid: string,
    contentTypeUid: string,
    targetLocale: string,
    variantGroupId: string
  ): Promise<FallbackResult> {
    try {
      const variantGroup = await this.getVariantGroup(variantGroupId);
      if (!variantGroup) {
        throw new Error(`Variant group ${variantGroupId} not found`);
      }

      const targetLocaleConfig = variantGroup.locales.find(l => l.code === targetLocale);
      if (!targetLocaleConfig) {
        throw new Error(`Locale ${targetLocale} not found in variant group`);
      }

      const fallbackChain = targetLocaleConfig.fallback || [];
      const allLocales = [targetLocale, ...fallbackChain];
      
      const variantConfigs = await this.getVariantConfigs(entryUid, contentTypeUid);
      const availableConfigs = variantConfigs.filter(config => 
        allLocales.includes(config.locale)
      );

      if (availableConfigs.length === 0) {
        return {
          content: {},
          usedFallback: [],
          missingFields: [],
          confidence: 0,
        };
      }

      // Find the best available content
      const bestConfig = availableConfigs.find(config => config.locale === targetLocale) ||
                        availableConfigs.find(config => fallbackChain.includes(config.locale)) ||
                        availableConfigs[0];

      const usedFallback = bestConfig.locale !== targetLocale ? 
        allLocales.slice(0, allLocales.indexOf(bestConfig.locale) + 1) : 
        [targetLocale];

      // Check for missing fields by comparing with the most complete version
      const mostCompleteConfig = availableConfigs.reduce((best, current) => 
        Object.keys(current.content).length > Object.keys(best.content).length ? current : best
      );

      const missingFields = Object.keys(mostCompleteConfig.content).filter(field => 
        !bestConfig.content.hasOwnProperty(field)
      );

      const confidence = bestConfig.locale === targetLocale ? 1.0 : 
                        Math.max(0.1, 1.0 - (usedFallback.length - 1) * 0.2);

      return {
        content: bestConfig.content,
        usedFallback,
        missingFields,
        confidence,
      };
    } catch (error) {
      console.error('Error resolving fallback:', error);
      throw new Error(`Failed to resolve fallback: ${error.message}`);
    }
  }

  // Variant Parameter Generation
  generateVariantParam(locale: string, fallbackChain: string[]): string {
    const allLocales = [locale, ...fallbackChain];
    return allLocales.join('_');
  }

  // Bulk Variant Creation
  async createBulkVariants(
    entryUids: string[],
    contentTypeUid: string,
    variantGroupId: string,
    locales: string[]
  ): Promise<VariantConfig[]> {
    try {
      const variantGroup = await this.getVariantGroup(variantGroupId);
      if (!variantGroup) {
        throw new Error(`Variant group ${variantGroupId} not found`);
      }

      const configs: VariantConfig[] = [];

      for (const entryUid of entryUids) {
        for (const locale of locales) {
          const localeConfig = variantGroup.locales.find(l => l.code === locale);
          if (!localeConfig) continue;

          const variantParam = this.generateVariantParam(locale, localeConfig.fallback || []);
          
          const config: Omit<VariantConfig, 'lastModified'> = {
            groupId: variantGroupId,
            entryUid,
            contentTypeUid,
            locale,
            variantParam,
            content: {},
            fallbackChain: localeConfig.fallback || [],
            isTranslated: false,
          };

          const createdConfig = await this.createVariantConfig(config);
          configs.push(createdConfig);
        }
      }

      return configs;
    } catch (error) {
      console.error('Error creating bulk variants:', error);
      throw new Error(`Failed to create bulk variants: ${error.message}`);
    }
  }

  // Utility Methods
  private generateId(): string {
    return `variant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Personalize Variant Integration
  async createPersonalizeVariant(
    name: string,
    attributes: Record<string, any>,
    experiences: any[] = [],
    audiences: any[] = []
  ): Promise<PersonalizeVariant> {
    try {
      const variant: PersonalizeVariant = {
        id: this.generateId(),
        name,
        attributes,
        experiences,
        audiences,
      };

      await this.client.variant().create(variant);
      
      return variant;
    } catch (error) {
      console.error('Error creating Personalize variant:', error);
      throw new Error(`Failed to create Personalize variant: ${error.message}`);
    }
  }

  async getPersonalizeVariants(): Promise<PersonalizeVariant[]> {
    try {
      const response = await this.client.variant().query().find();
      return response.items || [];
    } catch (error) {
      console.error('Error fetching Personalize variants:', error);
      throw new Error(`Failed to fetch Personalize variants: ${error.message}`);
    }
  }
}
