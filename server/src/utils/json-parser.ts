/**
 * JSON Parser Utility
 *
 * Shared utility for parsing JSON responses from AI services
 */

/**
 * Parse JSON response with error handling
 * Handles both clean JSON and JSON embedded in markdown code blocks
 */
export function parseAIResponse<T = any>(content: string): T {
  try {
    // Try direct parse first
    return JSON.parse(content);
  } catch (error) {
    // Try to extract JSON from markdown code blocks or text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerError) {
        console.error('Failed to parse extracted JSON:', jsonMatch[0]);
        throw new Error('Invalid JSON response from AI');
      }
    }
    console.error('Failed to parse JSON:', content);
    throw new Error('Invalid JSON response from AI');
  }
}
