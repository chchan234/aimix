import { GoogleGenerativeAI } from '@google/generative-ai';
import { parseAIResponse } from '../../utils/json-parser.js';

export class GeminiClient {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined');
    }

    this.client = new GoogleGenerativeAI(apiKey);
    this.model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-image-preview';
  }

  /**
   * Text generation with Gemini
   */
  async generateText(
    prompt: string,
    options: {
      temperature?: number;
      maxTokens?: number;
    } = {}
  ) {
    const startTime = Date.now();

    try {
      const model = this.client.getGenerativeModel({
        model: this.model
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      const responseTime = Date.now() - startTime;

      console.log(`✅ Gemini text generation completed in ${responseTime}ms`);

      return {
        content,
        usage: {
          promptTokens: 0, // Gemini doesn't provide token counts
          completionTokens: 0,
          totalTokens: 0,
        },
        responseTime,
      };
    } catch (error) {
      console.error('❌ Gemini generation error:', error);
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
