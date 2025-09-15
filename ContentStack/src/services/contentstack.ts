import { ContentstackClient } from '@contentstack/management-sdk';
import { ContentstackClient as DeliveryClient } from '@contentstack/app-sdk';
import { ContentstackEntry, AppConfig } from '@/types';

export class ContentstackService {
  private managementClient: ContentstackClient;
  private deliveryClient: DeliveryClient;
  private config: AppConfig;

  constructor(config: AppConfig) {
    this.config = config;
    this.managementClient = new ContentstackClient({
      api_key: config.stackApiKey,
      management_token: config.managementToken,
    });
    this.deliveryClient = new DeliveryClient({
      api_key: config.stackApiKey,
      delivery_token: config.stackApiKey, // Will be updated with actual delivery token
      environment: 'development',
    });
  }

  // Entry Management
  async getEntry(uid: string, contentTypeUid: string, locale: string = 'en-us'): Promise<ContentstackEntry> {
    try {
      const entry = await this.managementClient
        .stack()
        .contentType(contentTypeUid)
        .entry(uid)
        .fetch({ locale });
      
      return {
        uid: entry.uid,
        title: entry.title || '',
        contentTypeUid,
        locale,
        content: entry.toJSON(),
        publishDetails: entry.publishDetails,
      };
    } catch (error) {
      console.error('Error fetching entry:', error);
      throw new Error(`Failed to fetch entry ${uid}: ${error.message}`);
    }
  }

  async getEntries(contentTypeUid: string, locale: string = 'en-us'): Promise<ContentstackEntry[]> {
    try {
      const entries = await this.managementClient
        .stack()
        .contentType(contentTypeUid)
        .entry()
        .query({ locale })
        .find();
      
      return entries.items.map(entry => ({
        uid: entry.uid,
        title: entry.title || '',
        contentTypeUid,
        locale,
        content: entry.toJSON(),
        publishDetails: entry.publishDetails,
      }));
    } catch (error) {
      console.error('Error fetching entries:', error);
      throw new Error(`Failed to fetch entries for ${contentTypeUid}: ${error.message}`);
    }
  }

  async updateEntry(
    uid: string, 
    contentTypeUid: string, 
    content: Record<string, any>, 
    locale: string = 'en-us'
  ): Promise<ContentstackEntry> {
    try {
      const entry = await this.managementClient
        .stack()
        .contentType(contentTypeUid)
        .entry(uid)
        .update({ content, locale });
      
      return {
        uid: entry.uid,
        title: entry.title || '',
        contentTypeUid,
        locale,
        content: entry.toJSON(),
        publishDetails: entry.publishDetails,
      };
    } catch (error) {
      console.error('Error updating entry:', error);
      throw new Error(`Failed to update entry ${uid}: ${error.message}`);
    }
  }

  async createEntry(
    contentTypeUid: string, 
    content: Record<string, any>, 
    locale: string = 'en-us'
  ): Promise<ContentstackEntry> {
    try {
      const entry = await this.managementClient
        .stack()
        .contentType(contentTypeUid)
        .entry()
        .create({ content, locale });
      
      return {
        uid: entry.uid,
        title: entry.title || '',
        contentTypeUid,
        locale,
        content: entry.toJSON(),
        publishDetails: entry.publishDetails,
      };
    } catch (error) {
      console.error('Error creating entry:', error);
      throw new Error(`Failed to create entry: ${error.message}`);
    }
  }

  async publishEntry(uid: string, contentTypeUid: string, locale: string = 'en-us'): Promise<void> {
    try {
      await this.managementClient
        .stack()
        .contentType(contentTypeUid)
        .entry(uid)
        .publish({ locale });
    } catch (error) {
      console.error('Error publishing entry:', error);
      throw new Error(`Failed to publish entry ${uid}: ${error.message}`);
    }
  }

  // Content Type Management
  async getContentTypes(): Promise<any[]> {
    try {
      const contentTypes = await this.managementClient
        .stack()
        .contentType()
        .query()
        .find();
      
      return contentTypes.items;
    } catch (error) {
      console.error('Error fetching content types:', error);
      throw new Error(`Failed to fetch content types: ${error.message}`);
    }
  }

  async getContentType(uid: string): Promise<any> {
    try {
      const contentType = await this.managementClient
        .stack()
        .contentType(uid)
        .fetch();
      
      return contentType;
    } catch (error) {
      console.error('Error fetching content type:', error);
      throw new Error(`Failed to fetch content type ${uid}: ${error.message}`);
    }
  }

  // Locale Management
  async getLocales(): Promise<any[]> {
    try {
      const locales = await this.managementClient
        .stack()
        .locale()
        .query()
        .find();
      
      return locales.items;
    } catch (error) {
      console.error('Error fetching locales:', error);
      throw new Error(`Failed to fetch locales: ${error.message}`);
    }
  }

  // Bulk Operations
  async bulkUpdateEntries(
    updates: Array<{
      uid: string;
      contentTypeUid: string;
      content: Record<string, any>;
      locale: string;
    }>
  ): Promise<ContentstackEntry[]> {
    try {
      const results = await Promise.allSettled(
        updates.map(update => 
          this.updateEntry(update.uid, update.contentTypeUid, update.content, update.locale)
        )
      );

      const successful = results
        .filter((result): result is PromiseFulfilledResult<ContentstackEntry> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value);

      const failed = results
        .filter((result): result is PromiseRejectedResult => 
          result.status === 'rejected'
        );

      if (failed.length > 0) {
        console.warn(`${failed.length} entries failed to update:`, failed);
      }

      return successful;
    } catch (error) {
      console.error('Error in bulk update:', error);
      throw new Error(`Bulk update failed: ${error.message}`);
    }
  }
}
