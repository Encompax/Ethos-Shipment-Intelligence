/**
 * backend/integrations/velocity.js
 * 
 * Velocity adapter for the generic quality / operations capability.
 *
 * Fetches real-time execution data and normalizes it into platform-level
 * operations metrics.
 */

'use strict';

require('dotenv').config();
const axios = require('axios');
const IntegrationWorker = require('../lib/integration-worker');

const FACILITY_ID = process.env.VELOCITY_FACILITY_ID;

class VelocityIntegration extends IntegrationWorker {
  async sync() {
    const startTime = Date.now();
    
    try {
      this.log('Pulling quality and operations metrics...');
      
      const data = await this.fetchData();
      const metrics = this.normalizeToMetrics(data);
      this.saveMetrics(metrics);
      
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      this.log(`Synced in ${elapsed}s — ${metrics.length} metrics`);
    } catch (err) {
      this.error(`Sync failed: ${err.message}`);
      this.recordState('error', 0, err.message);
      throw err;
    }
  }

  async fetchData() {
    this.log('Fetching quality / operations metrics from adapter (STUB)...');

    // TODO: Implement Velocity API calls (REST or database)
    // Velocity may offer real-time data via WebSocket or polling
    // Reference: Consult Velocity API docs

    // STUB: Return mock production data
    return {
      oee_current: 0.87,
      changeovers_today: 3,
      wip_count: 127,
      schedule_attainment: 0.92,
      unplanned_downtime_minutes: 45,
      timestamp: new Date().toISOString(),
    };
  }

  normalizeToMetrics(data) {
    const metrics = [
      {
        metric_key: 'equipment_effectiveness_percent',
        value: data.oee_current * 100, // Store as percentage
        metadata: { unit: 'percent' },
      },
      {
        metric_key: 'changeover_count_today',
        value: data.changeovers_today,
        metadata: { facility_id: FACILITY_ID },
      },
      {
        metric_key: 'work_in_process_units',
        value: data.wip_count,
        metadata: { unit: 'units' },
      },
      {
        metric_key: 'schedule_attainment_percent',
        value: data.schedule_attainment * 100,
        metadata: { unit: 'percent' },
      },
      {
        metric_key: 'downtime_unplanned_minutes',
        value: data.unplanned_downtime_minutes,
        metadata: { today: true },
      },
    ];

    return metrics;
  }
}

module.exports = VelocityIntegration;
