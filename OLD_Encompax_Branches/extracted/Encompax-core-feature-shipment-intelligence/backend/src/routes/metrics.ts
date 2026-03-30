/**
 * backend/src/routes/metrics.ts
 * 
 * Metrics API — serves normalized metrics from all integrations.
 * 
 * GET  /api/metrics                    — list all recent metrics
 * GET  /api/metrics?source=operations_system   — filter by integration source
 * GET  /api/metrics?metric_key=...     — filter by metric key
 * GET  /api/metrics/summary            — aggregated metrics by source
 * GET  /api/metrics/integrations       — integration sync status
 */

import { Express, Request, Response, Router } from 'express';
import Database from 'better-sqlite3';
import path from 'path';

const METRICS_DB_PATH = process.env.METRICS_DB_PATH || path.join(__dirname, '..', '..', 'db', 'metrics.db');

/**
 * Get database connection (lazy load and cache).
 */
let metricsDb: Database.Database;

function getMetricsDb(): Database.Database {
  if (!metricsDb) {
    try {
      metricsDb = new Database(METRICS_DB_PATH, { readonly: true });
    } catch (err) {
      console.error('Failed to open metrics database:', err);
      throw err;
    }
  }
  return metricsDb;
}

export function registerMetricsRoutes(app: Express) {
  const router = Router();

  /**
   * GET /api/metrics
   * 
   * List all recent metrics with optional filters.
   * ?source=operations_system
   * ?metric_key=goal_scorecard_health_percent
   * ?limit=100 (default)
   * ?hours=24 (default, last 24 hours)
   */
  router.get('/', (req: Request, res: Response) => {
    try {
      const db = getMetricsDb();
      const { source, metric_key, limit = 100, hours = 24 } = req.query;

      let sql = `
        SELECT 
          id, source, metric_key, value, value_text, 
          timestamp, fetched_at, metadata
        FROM metrics
        WHERE timestamp > datetime('now', '-' || ? || ' hours')
      `;

      const params: any[] = [hours];

      if (source) {
        sql += ' AND source = ?';
        params.push(source);
      }

      if (metric_key) {
        sql += ' AND metric_key = ?';
        params.push(metric_key);
      }

      sql += ' ORDER BY timestamp DESC LIMIT ?';
      params.push(limit);

      const rows = db.prepare(sql).all(...params);

      res.json({
        count: rows.length,
        metrics: rows.map((row: any) => ({
          ...row,
          metadata: row.metadata ? JSON.parse(row.metadata) : null,
        })),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/metrics/latest
   * 
   * Get the latest value for each metric key (most recent timestamp).
   */
  router.get('/latest', (req: Request, res: Response) => {
    try {
      const db = getMetricsDb();
      const { source, hours = 24 } = req.query;

      let sql = `
        SELECT 
          source, metric_key, value, value_text, timestamp, fetched_at, metadata,
          ROW_NUMBER() OVER (PARTITION BY source, metric_key ORDER BY timestamp DESC) as rn
        FROM metrics
        WHERE timestamp > datetime('now', '-' || ? || ' hours')
      `;

      const params: any[] = [hours];

      if (source) {
        sql += ' AND source = ?';
        params.push(source);
      }

      sql = `SELECT source, metric_key, value, value_text, timestamp, fetched_at, metadata FROM (${sql}) WHERE rn = 1 ORDER BY source, metric_key`;

      const rows = db.prepare(sql).all(...params);

      res.json({
        count: rows.length,
        metrics: rows.map((row: any) => ({
          ...row,
          metadata: row.metadata ? JSON.parse(row.metadata) : null,
        })),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/metrics/summary
   * 
   * Summary stats: metrics count per source, last sync times, error counts.
   */
  router.get('/summary', (req: Request, res: Response) => {
    try {
      const db = getMetricsDb();

      // Get metrics count per source
      const metricCounts = db.prepare(`
        SELECT source, COUNT(*) as metric_count
        FROM metrics
        GROUP BY source
      `).all();

      // Get integration sync state
      const integrations = db.prepare(`
        SELECT 
          source, 
          last_sync_at, 
          last_sync_status, 
          last_sync_record_count,
          error_count,
          next_sync_at
        FROM integration_state
        ORDER BY source
      `).all();

      res.json({
        metrics_summary: metricCounts,
        integrations,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/metrics/signal/:metric_key
   * 
   * Get time-series data for a specific metric (for charting trends).
   * ?source=operations_system
   * ?days=7 (default, last 7 days)
   */
  router.get('/signal/:metric_key', (req: Request, res: Response) => {
    try {
      const db = getMetricsDb();
      const { metric_key } = req.params;
      const { source, days = 7 } = req.query;

      let sql = `
        SELECT 
          source, metric_key, value, value_text, 
          timestamp, metadata
        FROM metrics
        WHERE metric_key = ?
          AND timestamp > datetime('now', '-' || ? || ' days')
      `;

      const params: any[] = [metric_key, days];

      if (source) {
        sql += ' AND source = ?';
        params.push(source);
      }

      sql += ' ORDER BY timestamp ASC';

      const rows = db.prepare(sql).all(...params);

      res.json({
        metric_key,
        source: source || 'all',
        days,
        data_points: rows.length,
        data: rows.map((row: any) => ({
          source: row.source,
          value: row.value,
          value_text: row.value_text,
          timestamp: row.timestamp,
          metadata: row.metadata ? JSON.parse(row.metadata) : null,
        })),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/metrics/health
   * 
   * Integration health check — shows which integrations are syncing successfully.
   */
  router.get('/health', (req: Request, res: Response) => {
    try {
      const db = getMetricsDb();

      const integrations = db.prepare(`
        SELECT 
          source,
          last_sync_status,
          last_sync_at,
          error_count,
          next_sync_at
        FROM integration_state
        ORDER BY last_sync_at DESC
      `).all();

      const healthy = integrations.filter((i: any) => i.last_sync_status === 'success');
      const unhealthy = integrations.filter((i: any) => i.last_sync_status !== 'success');

      res.json({
        status: unhealthy.length === 0 ? 'healthy' : 'degraded',
        healthy_count: healthy.length,
        unhealthy_count: unhealthy.length,
        total: integrations.length,
        healthy_integrations: healthy,
        unhealthy_integrations: unhealthy,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Mount route
  app.use('/api/metrics', router);
}
