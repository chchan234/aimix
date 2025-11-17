/**
 * Image Validation Utility
 *
 * Validates image size and format for security
 */

const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

/**
 * Validate base64 image size
 * @param base64Image - Base64 encoded image (with or without data URI prefix)
 * @returns true if valid, throws error if invalid
 */
export function validateBase64ImageSize(base64Image: string): boolean {
  // Remove data URI prefix if present
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');

  // Calculate approximate byte size
  // Base64 encoding adds ~33% overhead, so we decode to get actual size
  const byteSize = (base64Data.length * 3) / 4;

  // Adjust for padding
  const padding = (base64Data.match(/=/g) || []).length;
  const actualSize = byteSize - padding;

  if (actualSize > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(
      `Image size exceeds maximum allowed size of ${MAX_IMAGE_SIZE_MB}MB. ` +
      `Current size: ${(actualSize / (1024 * 1024)).toFixed(2)}MB`
    );
  }

  return true;
}

/**
 * Validate image format from base64 data URI
 * @param base64Image - Base64 encoded image with data URI prefix
 * @returns true if valid format, throws error if invalid
 */
export function validateImageFormat(base64Image: string): boolean {
  const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  // Check if it has data URI prefix
  if (!base64Image.startsWith('data:image/')) {
    // If no prefix, assume it's valid (will be added later)
    return true;
  }

  // Extract format from data URI
  const formatMatch = base64Image.match(/^data:(image\/\w+);base64,/);
  if (!formatMatch) {
    throw new Error('Invalid image format. Must be a valid data URI.');
  }

  const format = formatMatch[1];
  if (!allowedFormats.includes(format)) {
    throw new Error(
      `Invalid image format: ${format}. ` +
      `Allowed formats: ${allowedFormats.join(', ')}`
    );
  }

  return true;
}

/**
 * Comprehensive image validation
 * @param base64Image - Base64 encoded image
 * @returns true if valid, throws error with details if invalid
 */
export function validateImage(base64Image: string): boolean {
  validateImageFormat(base64Image);
  validateBase64ImageSize(base64Image);
  return true;
}
