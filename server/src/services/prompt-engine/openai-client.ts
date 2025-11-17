import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { parseAIResponse } from '../../utils/json-parser.js';

export class OpenAIClient {
  private client: OpenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not defined');
    }

    this.client = new OpenAI({
      apiKey,
    });

    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  /**
   * Text generation with chat completion
   */
  async chat(
    messages: ChatCompletionMessageParam[],
    options: {
      temperature?: number;
      maxTokens?: number;
      responseFormat?: 'json' | 'text';
      topP?: number;
    } = {}
  ) {
    const startTime = Date.now();

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2000,
        top_p: options.topP ?? 1,
        response_format:
          options.responseFormat === 'json'
            ? { type: 'json_object' }
            : undefined,
      });

      const responseTime = Date.now() - startTime;
      const content = response.choices[0]?.message?.content || '';
      const usage = response.usage;

      console.log(`✅ OpenAI chat completed in ${responseTime}ms`);
      console.log(`📊 Tokens used: ${usage?.total_tokens || 0}`);

      return {
        content,
        usage: {
          promptTokens: usage?.prompt_tokens || 0,
          completionTokens: usage?.completion_tokens || 0,
          totalTokens: usage?.total_tokens || 0,
        },
        responseTime,
      };
    } catch (error) {
      console.error('❌ OpenAI chat error:', error);
      throw error;
    }
  }

  /**
   * Vision analysis with GPT-4o mini
   */
  async vision(
    imageUrl: string,
    prompt: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      responseFormat?: 'json' | 'text';
    } = {}
  ) {
    const startTime = Date.now();

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'high',
                },
              },
            ],
          },
        ],
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2000,
        response_format:
          options.responseFormat === 'json'
            ? { type: 'json_object' }
            : undefined,
      });

      const responseTime = Date.now() - startTime;
      const content = response.choices[0]?.message?.content || '';
      const usage = response.usage;

      console.log(`✅ OpenAI vision completed in ${responseTime}ms`);
      console.log(`📊 Tokens used: ${usage?.total_tokens || 0}`);

      return {
        content,
        usage: {
          promptTokens: usage?.prompt_tokens || 0,
          completionTokens: usage?.completion_tokens || 0,
          totalTokens: usage?.total_tokens || 0,
        },
        responseTime,
      };
    } catch (error) {
      console.error('❌ OpenAI vision error:', error);
      throw error;
    }
  }

  /**
   * Parse JSON response with error handling
   */
  parseJSON<T = any>(content: string): T {
    return parseAIResponse<T>(content);
  }
}
