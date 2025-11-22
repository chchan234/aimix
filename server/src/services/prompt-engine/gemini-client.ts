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
   * Image generation with Gemini (using Imagen 3)
   */
  async generateImage(
    prompt: string,
    options: {
      numberOfImages?: number;
      aspectRatio?: string;
    } = {}
  ) {
    const startTime = Date.now();

    try {
      const model = this.client.getGenerativeModel({
        model: 'gemini-2.5-flash-image'
      });

      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          responseModalities: ['Text', 'Image'],
        } as any
      });

      const response = await result.response;

      // Check if response contains image data
      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) {
        console.error('❌ No candidates in response:', JSON.stringify(response, null, 2));
        throw new Error('No image generated');
      }

      const candidate = candidates[0];
      if (!candidate.content || !candidate.content.parts) {
        console.error('❌ No content or parts in candidate:', JSON.stringify(candidate, null, 2));
        throw new Error('No content in response candidate');
      }

      // Extract image from response
      const imageData = candidate.content.parts.find(part =>
        'inlineData' in part && part.inlineData?.mimeType?.startsWith('image/')
      );

      if (!imageData || !('inlineData' in imageData) || !imageData.inlineData) {
        console.error('❌ No image data found in parts:', JSON.stringify(candidate.content.parts, null, 2));
        throw new Error('No image data in response');
      }

      const responseTime = Date.now() - startTime;
      console.log(`✅ Gemini image generation completed in ${responseTime}ms`);

      return {
        imageData: imageData.inlineData.data,
        mimeType: imageData.inlineData.mimeType,
        responseTime,
      };
    } catch (error) {
      console.error('❌ Gemini image generation error:', error);
      throw error;
    }
  }

  /**
   * Analyze image and generate edited version
   */
  async editImage(
    imageBase64: string,
    editPrompt: string,
    mimeType: string = 'image/jpeg'
  ) {
    const startTime = Date.now();

    try {
      const model = this.client.getGenerativeModel({
        model: 'gemini-2.5-flash-image'
      });

      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [
            {
              inlineData: {
                data: imageBase64,
                mimeType: mimeType
              }
            },
            {
              text: editPrompt
            }
          ]
        }],
        generationConfig: {
          responseModalities: ['Image'],
        } as any
      });

      const response = await result.response;
      const candidates = response.candidates;

      if (!candidates || candidates.length === 0) {
        throw new Error('No edited image generated');
      }

      const candidate = candidates[0];
      if (!candidate.content) {
        console.error('❌ Candidate has no content:', JSON.stringify(candidate, null, 2));
        throw new Error('No content in response candidate');
      }

      if (!candidate.content.parts || candidate.content.parts.length === 0) {
        console.error('❌ Candidate content has no parts:', JSON.stringify(candidate.content, null, 2));
        throw new Error('No parts in response content');
      }

      const imageData = candidate.content.parts.find(part =>
        'inlineData' in part && part.inlineData?.mimeType?.startsWith('image/')
      );

      if (!imageData || !('inlineData' in imageData) || !imageData.inlineData) {
        console.error('❌ No image data found in parts:', JSON.stringify(candidate.content.parts, null, 2));
        throw new Error('No image data in response');
      }

      const responseTime = Date.now() - startTime;
      console.log(`✅ Gemini image editing completed in ${responseTime}ms`);

      return {
        imageData: imageData.inlineData.data,
        mimeType: imageData.inlineData.mimeType,
        responseTime,
      };
    } catch (error) {
      console.error('❌ Gemini image editing error:', error);
      throw error;
    }
  }


  /**
   * Analyze image and return text response (for face analysis, lookalike, etc.)
   */
  async analyzeImageWithText(
    imageBase64: string,
    prompt: string,
    mimeType: string = 'image/jpeg'
  ) {
    const startTime = Date.now();

    try {
      const model = this.client.getGenerativeModel({
        model: 'gemini-2.5-flash-image'
      });

      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [
            {
              inlineData: {
                data: imageBase64,
                mimeType: mimeType
              }
            },
            {
              text: prompt
            }
          ]
        }]
      });

      const response = await result.response;
      const content = response.text();

      const responseTime = Date.now() - startTime;
      console.log(`✅ Gemini image analysis completed in ${responseTime}ms`);

      return content;
    } catch (error) {
      console.error('❌ Gemini image analysis error:', error);
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
