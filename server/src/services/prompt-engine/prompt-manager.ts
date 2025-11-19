import { db } from '../../db';
import { promptTemplates, promptExperiments, type PromptTemplate } from '../../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import type { Redis } from 'ioredis';

export class PromptManager {
  private redis?: Redis;
  private cacheTimeout = 3600; // 1 hour

  constructor(redis?: Redis) {
    this.redis = redis;
  }

  /**
   * Get prompt template with caching
   */
  async getTemplate(serviceType: string): Promise<PromptTemplate | null> {
    const cacheKey = `prompt:${serviceType}`;

    // Try Redis cache first
    if (this.redis) {
      try {
        const cached = await this.redis.get(cacheKey);
        if (cached) {
          console.log(`📦 Cache HIT for ${serviceType}`);
          return JSON.parse(cached);
        }
      } catch (error) {
        console.error('Redis cache error:', error);
      }
    }

    console.log(`📡 Cache MISS for ${serviceType}, fetching from DB...`);

    // Check for active A/B experiment
    const experiment = await this.getActiveExperiment(serviceType);
    if (experiment) {
      return this.selectTemplateForExperiment(experiment);
    }

    // Get latest active template
    const templates = await db
      .select()
      .from(promptTemplates)
      .where(
        and(
          eq(promptTemplates.serviceType, serviceType),
          eq(promptTemplates.isActive, true)
        )
      )
      .orderBy(desc(promptTemplates.createdAt))
      .limit(1);

    const template = templates[0] || null;

    // Cache result
    if (template && this.redis) {
      try {
        await this.redis.setex(
          cacheKey,
          this.cacheTimeout,
          JSON.stringify(template)
        );
      } catch (error) {
        console.error('Redis cache write error:', error);
      }
    }

    return template;
  }

  /**
   * Get active A/B experiment
   */
  private async getActiveExperiment(serviceType: string) {
    const experiments = await db
      .select()
      .from(promptExperiments)
      .where(
        and(
          eq(promptExperiments.serviceType, serviceType),
          eq(promptExperiments.status, 'running')
        )
      )
      .limit(1);

    return experiments[0] || null;
  }

  /**
   * Select template based on A/B experiment
   */
  private async selectTemplateForExperiment(experiment: any): Promise<PromptTemplate> {
    // Random selection based on traffic split
    const random = Math.random() * 100;
    const templateId =
      random < experiment.trafficSplit
        ? experiment.templateAId
        : experiment.templateBId;

    const templates = await db
      .select()
      .from(promptTemplates)
      .where(eq(promptTemplates.id, templateId))
      .limit(1);

    // Update experiment counts
    const field =
      templateId === experiment.templateAId ? 'versionACount' : 'versionBCount';

    await db
      .update(promptExperiments)
      .set({
        [field]: experiment[field] + 1,
      })
      .where(eq(promptExperiments.id, experiment.id));

    return templates[0];
  }

  /**
   * Render prompt template with variables
   */
  renderPrompt(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = variables[key];
      if (value === undefined || value === null) {
        console.warn(`⚠️  Variable "${key}" not found in template`);
        return match;
      }
      return String(value);
    });
  }

  /**
   * Track performance metrics
   */
  async trackPerformance(
    templateId: string,
    tokensUsed: number,
    responseTime: number
  ): Promise<void> {
    try {
      const templates = await db
        .select()
        .from(promptTemplates)
        .where(eq(promptTemplates.id, templateId))
        .limit(1);

      const template = templates[0];
      if (!template) return;

      const newUsageCount = template.usageCount + 1;
      const newAvgTokens = template.avgTokens
        ? Math.round((template.avgTokens * template.usageCount + tokensUsed) / newUsageCount)
        : tokensUsed;
      const newAvgResponseTime = template.avgResponseTime
        ? Math.round((template.avgResponseTime * template.usageCount + responseTime) / newUsageCount)
        : responseTime;

      await db
        .update(promptTemplates)
        .set({
          usageCount: newUsageCount,
          avgTokens: newAvgTokens,
          avgResponseTime: newAvgResponseTime,
          updatedAt: new Date(),
        })
        .where(eq(promptTemplates.id, templateId));

      console.log(`📊 Performance tracked for template ${templateId}`);
    } catch (error) {
      console.error('Failed to track performance:', error);
    }
  }

  /**
   * Invalidate cache for a service
   */
  async invalidateCache(serviceType: string): Promise<void> {
    if (!this.redis) return;

    const cacheKey = `prompt:${serviceType}`;
    try {
      await this.redis.del(cacheKey);
      console.log(`🗑️  Cache invalidated for ${serviceType}`);
    } catch (error) {
      console.error('Redis cache invalidation error:', error);
    }
  }
}
