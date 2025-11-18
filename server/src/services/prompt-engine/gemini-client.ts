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
          responseModalities: ['Image'],
        }
      });

      const response = await result.response;

      // Check if response contains image data
      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error('No image generated');
      }

      // Extract image from response
      const imageData = candidates[0].content.parts.find(part =>
        'inlineData' in part && part.inlineData?.mimeType?.startsWith('image/')
      );

      if (!imageData || !('inlineData' in imageData)) {
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
        }
      });

      const response = await result.response;
      const candidates = response.candidates;

      if (!candidates || candidates.length === 0) {
        throw new Error('No edited image generated');
      }

      const imageData = candidates[0].content.parts.find(part =>
        'inlineData' in part && part.inlineData?.mimeType?.startsWith('image/')
      );

      if (!imageData || !('inlineData' in imageData)) {
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
   * Edit image with reference to another image (for face swap, style transfer, etc.)
   */
  async editImageWithReference(
    sourceImageBase64: string,
    referenceImageBase64: string,
    editPrompt: string,
    sourceMimeType: string = 'image/jpeg',
    referenceMimeType: string = 'image/jpeg'
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
                data: sourceImageBase64,
                mimeType: sourceMimeType
              }
            },
            {
              inlineData: {
                data: referenceImageBase64,
                mimeType: referenceMimeType
              }
            },
            {
              text: editPrompt
            }
          ]
        }],
        generationConfig: {
          responseModalities: ['Image'],
        }
      });

      const response = await result.response;
      const candidates = response.candidates;

      if (!candidates || candidates.length === 0) {
        throw new Error('No edited image generated');
      }

      const imageData = candidates[0].content.parts.find(part =>
        'inlineData' in part && part.inlineData?.mimeType?.startsWith('image/')
      );

      if (!imageData || !('inlineData' in imageData)) {
        throw new Error('No image data in response');
      }

      const responseTime = Date.now() - startTime;
      console.log(`✅ Gemini image editing with reference completed in ${responseTime}ms`);

      return {
        imageData: imageData.inlineData.data,
        mimeType: imageData.inlineData.mimeType,
        responseTime,
      };
    } catch (error) {
      console.error('❌ Gemini image editing with reference error:', error);
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
