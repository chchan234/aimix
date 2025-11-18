/**
 * Vercel Serverless Function Entry Point
 *
 * This file imports the Express app from server/src/index.ts
 * and exports it for Vercel's serverless environment.
 *
 * Using dynamic import to support ES modules in Vercel serverless.
 */

export default async function handler(req: any, res: any) {
  // Dynamic import to load the Express app
  const { default: app } = await import('../server/src/index.js');

  // Pass the request to the Express app
  return app(req, res);
}
