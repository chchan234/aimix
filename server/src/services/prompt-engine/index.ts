import { PromptManager } from './prompt-manager';
import { OpenAIClient } from './openai-client';
import { GeminiImageClient } from './gemini-image-client';
import type { Redis } from 'ioredis';
import { z } from 'zod';

export class PromptEngine {
  private promptManager: PromptManager;
  private openai: OpenAIClient;
  private gemini: GeminiImageClient;

  constructor(redis?: Redis) {
    this.promptManager = new PromptManager(redis);
    this.openai = new OpenAIClient();
    this.gemini = new GeminiImageClient();
  }

  /**
   * Execute text prompt using GPT-4o mini
   */
  async executeTextPrompt<T = any>(
    serviceType: string,
    variables: Record<string, any>,
    userId?: string
  ): Promise<T> {
    console.log(`🚀 Executing text prompt for service: ${serviceType}`);

    // 1. Get template
    const template = await this.promptManager.getTemplate(serviceType);
    if (!template) {
      throw new Error(`No active template found for ${serviceType}`);
    }

    if (template.aiModel !== 'gpt-4o-mini') {
      throw new Error(`Invalid AI model for text prompt: ${template.aiModel}`);
    }

    // 2. Render prompts
    const systemPrompt = template.systemPrompt || '';
    const userPrompt = this.promptManager.renderPrompt(
      template.userPromptTemplate,
      variables
    );

    console.log(`📝 System Prompt: ${systemPrompt.substring(0, 100)}...`);
    console.log(`📝 User Prompt: ${userPrompt.substring(0, 100)}...`);

    // 3. Execute AI request
    const params = template.parameters as any;
    const response = await this.openai.chat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        temperature: params.temperature ?? 0.7,
        maxTokens: params.max_tokens ?? 2000,
        responseFormat: params.response_format as 'json' | 'text',
        topP: params.top_p,
      }
    );

    // 4. Track performance
    await this.promptManager.trackPerformance(
      template.id,
      response.usage.totalTokens,
      response.responseTime
    );

    // 5. Parse result
    let result: any;
    if (template.outputFormat === 'json') {
      result = this.openai.parseJSON(response.content);

      // Validate with Zod if schema provided
      if (template.validationSchema) {
        try {
          const schema = z.object(template.validationSchema as any);
          result = schema.parse(result);
        } catch (error) {
          console.warn('⚠️  Validation failed, returning unvalidated result:', error);
        }
      }
    } else {
      result = response.content;
    }

    console.log(`✅ Text prompt executed successfully`);
    return result as T;
  }

  /**
   * Execute vision prompt using GPT-4o mini
   */
  async executeVisionPrompt<T = any>(
    serviceType: string,
    imageUrl: string,
    variables: Record<string, any>,
    userId?: string
  ): Promise<T> {
    console.log(`🚀 Executing vision prompt for service: ${serviceType}`);

    // 1. Get template
    const template = await this.promptManager.getTemplate(serviceType);
    if (!template) {
      throw new Error(`No active template found for ${serviceType}`);
    }

    if (template.aiModel !== 'gpt-4o-mini') {
      throw new Error(`Invalid AI model for vision prompt: ${template.aiModel}`);
    }

    // 2. Render prompt
    const prompt = this.promptManager.renderPrompt(
      template.userPromptTemplate,
      variables
    );

    // Add system prompt to the user prompt
    const fullPrompt = template.systemPrompt
      ? `${template.systemPrompt}\n\n${prompt}`
      : prompt;

    console.log(`📝 Vision Prompt: ${fullPrompt.substring(0, 100)}...`);
    console.log(`🖼️  Image URL: ${imageUrl}`);

    // 3. Execute AI request
    const params = template.parameters as any;
    const response = await this.openai.vision(imageUrl, fullPrompt, {
      temperature: params.temperature ?? 0.7,
      maxTokens: params.max_tokens ?? 2000,
      responseFormat: params.response_format as 'json' | 'text',
    });

    // 4. Track performance
    await this.promptManager.trackPerformance(
      template.id,
      response.usage.totalTokens,
      response.responseTime
    );

    // 5. Parse result
    let result: any;
    if (template.outputFormat === 'json') {
      result = this.openai.parseJSON(response.content);
    } else {
      result = response.content;
    }

    console.log(`✅ Vision prompt executed successfully`);
    return result as T;
  }

  /**
   * Execute image generation prompt using Gemini 2.5 Flash Image
   */
  async executeImagePrompt(
    serviceType: string,
    variables: Record<string, any>,
    inputImages?: string[], // URLs or base64
    userId?: string
  ): Promise<string> {
    console.log(`🚀 Executing image prompt for service: ${serviceType}`);

    // 1. Get template
    const template = await this.promptManager.getTemplate(serviceType);
    if (!template) {
      throw new Error(`No active template found for ${serviceType}`);
    }

    if (template.aiModel !== 'gemini-2.5-flash-image') {
      throw new Error(`Invalid AI model for image prompt: ${template.aiModel}`);
    }

    // 2. Render prompt
    const prompt = this.promptManager.renderPrompt(
      template.userPromptTemplate,
      variables
    );

    console.log(`📝 Image Prompt: ${prompt.substring(0, 100)}...`);

    const startTime = Date.now();
    let imageBase64: string;

    try {
      const params = template.parameters as any;

      // 3. Execute based on mode
      if (!inputImages || inputImages.length === 0) {
        // Generation mode
        imageBase64 = await this.gemini.generate(prompt, {
          aspectRatio: params.aspect_ratio ?? '1:1',
          numberOfImages: params.number_of_images ?? 1,
        });
      } else if (inputImages.length === 1) {
        // Edit mode
        const imageData = inputImages[0].startsWith('http')
          ? await this.gemini.urlToBase64(inputImages[0])
          : inputImages[0];

        imageBase64 = await this.gemini.edit(imageData, prompt, {
          aspectRatio: params.aspect_ratio ?? '1:1',
        });
      } else {
        // Merge mode
        const imageDataArray = await Promise.all(
          inputImages.map((img) =>
            img.startsWith('http') ? this.gemini.urlToBase64(img) : Promise.resolve(img)
          )
        );

        imageBase64 = await this.gemini.merge(imageDataArray, prompt, {
          aspectRatio: params.aspect_ratio ?? '1:1',
        });
      }

      const responseTime = Date.now() - startTime;

      // 4. Track performance (fixed 1290 tokens for Gemini image)
      await this.promptManager.trackPerformance(template.id, 1290, responseTime);

      console.log(`✅ Image prompt executed successfully`);
      return imageBase64;
    } catch (error) {
      console.error('❌ Image prompt execution failed:', error);
      throw error;
    }
  }

  /**
   * Invalidate cache for a service
   */
  async invalidateCache(serviceType: string): Promise<void> {
    await this.promptManager.invalidateCache(serviceType);
  }
}

// Export singleton instance
let promptEngineInstance: PromptEngine | null = null;

export function getPromptEngine(redis?: Redis): PromptEngine {
  if (!promptEngineInstance) {
    promptEngineInstance = new PromptEngine(redis);
  }
  return promptEngineInstance;
}

export * from './prompt-manager';
export * from './openai-client';
export * from './gemini-image-client';
