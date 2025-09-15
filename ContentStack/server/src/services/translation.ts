import OpenAI from 'openai';
import { Groq } from 'groq-sdk';
import axios from 'axios';
import { 
  TranslationRequest, 
  TranslationResponse, 
  AITranslationConfig,
  ServerConfig 
} from '../types';

export class TranslationService {
  private openai?: OpenAI;
  private groq?: Groq;
  private config: ServerConfig;

  constructor(config: ServerConfig) {
    this.config = config;
    
    if (config.ai.openai.apiKey) {
      this.openai = new OpenAI({
        apiKey: config.ai.openai.apiKey,
      });
    }

    if (config.ai.groq.apiKey) {
      this.groq = new Groq({
        apiKey: config.ai.groq.apiKey,
      });
    }
  }

  async translateContent(
    request: TranslationRequest,
    aiConfig: AITranslationConfig = { provider: 'openai' }
  ): Promise<TranslationResponse> {
    try {
      let translatedContent: Record<string, any>;
      let method: 'manual' | 'ai' | 'fallback' = 'ai';
      let provider: string = aiConfig.provider;
      let confidence: number = 0.8;

      if (request.useAI && aiConfig.provider) {
        translatedContent = await this.translateWithAI(request, aiConfig);
        method = 'ai';
        provider = aiConfig.provider;
        confidence = 0.9;
      } else {
        // Manual translation placeholder - in real app, this would be user input
        translatedContent = await this.translateManually(request);
        method = 'manual';
        confidence = 1.0;
      }

      return {
        translatedContent,
        confidence,
        method,
        timestamp: new Date().toISOString(),
        provider,
      };
    } catch (error: any) {
      console.error('Translation error:', error);
      throw new Error(`Translation failed: ${error.message}`);
    }
  }

  private async translateWithAI(
    request: TranslationRequest,
    config: AITranslationConfig
  ): Promise<Record<string, any>> {
    const { content, sourceLocale, targetLocale } = request;
    
    // Convert object to translatable text
    const textToTranslate = this.extractTextFromContent(content);
    
    let translatedText: string;

    switch (config.provider) {
      case 'openai':
        translatedText = await this.translateWithOpenAI(textToTranslate, sourceLocale, targetLocale, config);
        break;
      case 'groq':
        translatedText = await this.translateWithGroq(textToTranslate, sourceLocale, targetLocale, config);
        break;
      case 'google':
        translatedText = await this.translateWithGoogle(textToTranslate, sourceLocale, targetLocale);
        break;
      case 'deepl':
        translatedText = await this.translateWithDeepL(textToTranslate, sourceLocale, targetLocale);
        break;
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }

    // Convert translated text back to content structure
    return this.reconstructContentFromText(content, translatedText);
  }

  private async translateWithOpenAI(
    text: string,
    sourceLocale: string,
    targetLocale: string,
    config: AITranslationConfig
  ): Promise<string> {
    if (!this.openai) {
      // Return mock translation for development
      return `[Mock OpenAI Translation] ${text} (${sourceLocale} → ${targetLocale})`;
    }

    const systemPrompt = `You are a professional translator. Translate the following text from ${sourceLocale} to ${targetLocale}. 
    Maintain the original structure, formatting, and meaning. Return only the translated text without any explanations.`;

    const response = await this.openai.chat.completions.create({
      model: config.model || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      temperature: config.temperature || 0.3,
      max_tokens: config.maxTokens || 2000,
    });

    return response.choices[0]?.message?.content || '';
  }

  private async translateWithGroq(
    text: string,
    sourceLocale: string,
    targetLocale: string,
    config: AITranslationConfig
  ): Promise<string> {
    if (!this.groq) {
      // Return mock translation for development
      return `[Mock Groq Translation] ${text} (${sourceLocale} → ${targetLocale})`;
    }

    const systemPrompt = `You are a professional translator. Translate the following text from ${sourceLocale} to ${targetLocale}. 
    Maintain the original structure, formatting, and meaning. Return only the translated text without any explanations.`;

    const response = await this.groq.chat.completions.create({
      model: config.model || 'llama3-8b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      temperature: config.temperature || 0.3,
      max_tokens: config.maxTokens || 2000,
    });

    return response.choices[0]?.message?.content || '';
  }

  private async translateWithGoogle(
    text: string,
    sourceLocale: string,
    targetLocale: string
  ): Promise<string> {
    if (!this.config.ai.google.apiKey) {
      // Return mock translation for development
      return `[Mock Google Translation] ${text} (${sourceLocale} → ${targetLocale})`;
    }

    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${this.config.ai.google.apiKey}`,
      {
        q: text,
        source: sourceLocale,
        target: targetLocale,
        format: 'text'
      }
    );

    return response.data.data.translations[0].translatedText;
  }

  private async translateWithDeepL(
    text: string,
    sourceLocale: string,
    targetLocale: string
  ): Promise<string> {
    if (!this.config.ai.deepl.apiKey) {
      // Return mock translation for development
      return `[Mock DeepL Translation] ${text} (${sourceLocale} → ${targetLocale})`;
    }

    const response = await axios.post(
      'https://api-free.deepl.com/v2/translate',
      {
        text: [text],
        source_lang: sourceLocale.toUpperCase(),
        target_lang: targetLocale.toUpperCase(),
      },
      {
        headers: {
          'Authorization': `DeepL-Auth-Key ${this.config.ai.deepl.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data.translations[0].text;
  }

  private async translateManually(request: TranslationRequest): Promise<Record<string, any>> {
    // In a real application, this would interface with a manual translation workflow
    // For now, return the original content with a placeholder
    const { content } = request;
    const translatedContent: Record<string, any> = {};

    for (const [key, value] of Object.entries(content)) {
      if (typeof value === 'string') {
        translatedContent[key] = `[TRANSLATE: ${value}]`;
      } else if (typeof value === 'object' && value !== null) {
        translatedContent[key] = await this.translateManually({
          ...request,
          content: value as Record<string, any>
        });
      } else {
        translatedContent[key] = value;
      }
    }

    return translatedContent;
  }

  private extractTextFromContent(content: Record<string, any>): string {
    const texts: string[] = [];

    const extractText = (obj: any): void => {
      if (typeof obj === 'string') {
        texts.push(obj);
      } else if (typeof obj === 'object' && obj !== null) {
        Object.values(obj).forEach(extractText);
      }
    };

    extractText(content);
    return texts.join('\n---\n');
  }

  private reconstructContentFromText(
    originalContent: Record<string, any>,
    translatedText: string
  ): Record<string, any> {
    const translatedLines = translatedText.split('\n---\n');
    let lineIndex = 0;

    const reconstruct = (obj: any): any => {
      if (typeof obj === 'string') {
        return translatedLines[lineIndex++] || obj;
      } else if (typeof obj === 'object' && obj !== null) {
        const result: Record<string, any> = {};
        for (const [key, value] of Object.entries(obj)) {
          result[key] = reconstruct(value);
        }
        return result;
      }
      return obj;
    };

    return reconstruct(originalContent);
  }

  // Batch Translation
  async translateBatch(
    requests: TranslationRequest[],
    aiConfig: AITranslationConfig = { provider: 'openai' }
  ): Promise<TranslationResponse[]> {
    try {
      const results = await Promise.allSettled(
        requests.map(request => this.translateContent(request, aiConfig))
      );

      return results
        .filter((result): result is PromiseFulfilledResult<TranslationResponse> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value);
    } catch (error: any) {
      console.error('Batch translation error:', error);
      throw new Error(`Batch translation failed: ${error.message}`);
    }
  }

  // Language Detection
  async detectLanguage(text: string): Promise<string> {
    try {
      if (this.openai) {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a language detection expert. Identify the language of the given text and return only the ISO 639-1 language code (e.g., "en", "es", "fr").'
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.1,
          max_tokens: 10,
        });

        return response.choices[0]?.message?.content?.trim() || 'en';
      }

      // Fallback to simple detection based on common patterns
      return this.simpleLanguageDetection(text);
    } catch (error: any) {
      console.error('Language detection error:', error);
      return this.simpleLanguageDetection(text);
    }
  }

  private simpleLanguageDetection(text: string): string {
    // Simple pattern-based language detection
    const patterns = {
      'en': /[a-zA-Z]/,
      'es': /[ñáéíóúü]/,
      'fr': /[àâäéèêëïîôöùûüÿç]/,
      'de': /[äöüß]/,
      'it': /[àèéìíîòóù]/,
      'pt': /[ãõáéíóú]/,
      'ru': /[а-яё]/,
      'zh': /[\u4e00-\u9fff]/,
      'ja': /[\u3040-\u309f\u30a0-\u30ff]/,
      'ko': /[\uac00-\ud7af]/,
      'ar': /[\u0600-\u06ff]/,
      'hi': /[\u0900-\u097f]/,
    };

    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        return lang;
      }
    }

    return 'en'; // Default fallback
  }
}
