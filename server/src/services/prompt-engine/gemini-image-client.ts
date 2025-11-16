import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiImageClient {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor() {
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY is not defined');
    }

    this.client = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    this.model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
  }

  /**
   * Generate image from text prompt
   */
  async generate(
    prompt: string,
    options: {
      aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
      numberOfImages?: number;
    } = {}
  ): Promise<string> {
    const startTime = Date.now();

    try {
      const model = this.client.getGenerativeModel({
        model: this.model,
      });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          candidateCount: options.numberOfImages ?? 1,
        },
      });

      const responseTime = Date.now() - startTime;

      // Extract image data
      const candidate = result.response.candidates?.[0];
      if (!candidate) {
        throw new Error('No image generated');
      }

      const imagePart = candidate.content.parts.find(
        (part: any) => part.inlineData
      );

      if (!imagePart || !imagePart.inlineData) {
        throw new Error('No image data in response');
      }

      console.log(`✅ Gemini image generation completed in ${responseTime}ms`);
      console.log(`📊 Fixed tokens: 1290 (Gemini 2.5 Flash Image)`);

      // Return base64 image data
      return imagePart.inlineData.data;
    } catch (error) {
      console.error('❌ Gemini image generation error:', error);
      throw error;
    }
  }

  /**
   * Edit image with natural language prompt
   */
  async edit(
    imageBase64: string,
    prompt: string,
    options: {
      aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
    } = {}
  ): Promise<string> {
    const startTime = Date.now();

    try {
      const model = this.client.getGenerativeModel({
        model: this.model,
      });

      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: imageBase64,
                },
              },
              { text: prompt },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
        },
      });

      const responseTime = Date.now() - startTime;

      const candidate = result.response.candidates?.[0];
      if (!candidate) {
        throw new Error('No edited image generated');
      }

      const imagePart = candidate.content.parts.find(
        (part: any) => part.inlineData
      );

      if (!imagePart || !imagePart.inlineData) {
        throw new Error('No image data in response');
      }

      console.log(`✅ Gemini image editing completed in ${responseTime}ms`);

      return imagePart.inlineData.data;
    } catch (error) {
      console.error('❌ Gemini image editing error:', error);
      throw error;
    }
  }

  /**
   * Merge multiple images (e.g., couple baby face)
   */
  async merge(
    imageBase64Array: string[],
    prompt: string,
    options: {
      aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
    } = {}
  ): Promise<string> {
    const startTime = Date.now();

    try {
      const model = this.client.getGenerativeModel({
        model: this.model,
      });

      // Build parts array with all images
      const parts: any[] = [];

      // Add all images
      for (const imageBase64 of imageBase64Array) {
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64,
          },
        });
      }

      // Add prompt
      parts.push({ text: prompt });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature: 0.4,
        },
      });

      const responseTime = Date.now() - startTime;

      const candidate = result.response.candidates?.[0];
      if (!candidate) {
        throw new Error('No merged image generated');
      }

      const imagePart = candidate.content.parts.find(
        (part: any) => part.inlineData
      );

      if (!imagePart || !imagePart.inlineData) {
        throw new Error('No image data in response');
      }

      console.log(`✅ Gemini image merging completed in ${responseTime}ms`);

      return imagePart.inlineData.data;
    } catch (error) {
      console.error('❌ Gemini image merging error:', error);
      throw error;
    }
  }

  /**
   * Convert image URL to base64
   */
  async urlToBase64(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      const buffer = await response.arrayBuffer();
      return Buffer.from(buffer).toString('base64');
    } catch (error) {
      console.error('Failed to convert image URL to base64:', error);
      throw error;
    }
  }
}
