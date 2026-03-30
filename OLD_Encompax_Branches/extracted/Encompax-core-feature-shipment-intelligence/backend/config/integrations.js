/**
 * backend/config/integrations.js
 *
 * Integration registry — defines capability-based integrations for the shared
 * platform. The registry should stay vendor-agnostic at the contract level,
 * while adapter files handle vendor-specific logic and credentials.
 */

'use strict';

require('dotenv').config();

/**
 * Integration registry. Each capability defines:
 * - enabled: feature flag (check env vars)
 * - adapter: vendor-specific module to load
 * - sync interval: how often to poll
 * - metrics: normalized data points exposed to the platform
 * - labels: default customer-facing naming that can be overridden per tenant
 */
const INTEGRATION_REGISTRY = {
  hris: {
    name: 'HRIS',
    capability: 'hris',
    adapter: 'paycom',
    vendor: 'paycom',
    defaultLabel: 'HR',
    enabled: !!process.env.PAYCOM_API_KEY,
    description: 'People, workforce, recruiting, and compensation metrics',
    requiredEnvVars: ['PAYCOM_API_KEY', 'PAYCOM_COMPANY_ID'],
    syncIntervalMs: parseInt(process.env.PAYCOM_SYNC_INTERVAL_MS || '3600000', 10), // 1 hour
    metrics: [
      'employee_count_active',
      'employee_turnover_ytd',
      'employee_turnover_rate',
      'labor_cost_per_employee',
      'recruiting_open_roles',
      'employee_average_tenure_months',
    ],
    dataPoints: {
      employee_count_active: { type: 'number', description: 'Current active employees' },
      employee_turnover_ytd: { type: 'number', description: 'Employees separated this year' },
      employee_turnover_rate: { type: 'percentage', description: 'Annual turnover rate' },
      labor_cost_per_employee: { type: 'currency', description: 'Average total labor cost per employee' },
      recruiting_open_roles: { type: 'number', description: 'Open roles or requisitions' },
      employee_average_tenure_months: { type: 'number', description: 'Average employee tenure in months' },
    },
  },

  erp: {
    name: 'ERP',
    capability: 'erp',
    adapter: 'dynamics-gp',
    vendor: 'dynamics_gp',
    defaultLabel: 'ERP',
    enabled: !!process.env.DYNAMICS_GP_API_KEY,
    description: 'Financial, customer, order, and receivables metrics',
    requiredEnvVars: ['DYNAMICS_GP_API_KEY', 'DYNAMICS_GP_TENANT_ID'],
    syncIntervalMs: parseInt(process.env.DYNAMICS_GP_SYNC_INTERVAL_MS || '1800000', 10), // 30 min
    metrics: [
      'accounts_receivable_total',
      'accounts_receivable_days_overdue',
      'revenue_month_to_date',
      'revenue_year_to_date',
      'customer_count_active',
      'invoice_average_value',
      'sales_orders_open_count',
    ],
    dataPoints: {
      accounts_receivable_total: { type: 'currency', description: 'Total accounts receivable' },
      accounts_receivable_days_overdue: { type: 'number', description: 'Average overdue age of receivables' },
      revenue_month_to_date: { type: 'currency', description: 'Revenue this month' },
      revenue_year_to_date: { type: 'currency', description: 'Revenue this year' },
      customer_count_active: { type: 'number', description: 'Total active customers' },
      invoice_average_value: { type: 'currency', description: 'Average invoice value' },
      sales_orders_open_count: { type: 'number', description: 'Open sales orders' },
    },
  },

  quality_operations: {
    name: 'Quality & Operations',
    capability: 'quality_operations',
    adapter: 'velocity',
    vendor: 'velocity',
    defaultLabel: 'Quality Management',
    enabled: !!process.env.VELOCITY_API_KEY,
    description: 'Operational execution and quality-related production metrics',
    requiredEnvVars: ['VELOCITY_API_KEY', 'VELOCITY_FACILITY_ID'],
    syncIntervalMs: parseInt(process.env.VELOCITY_SYNC_INTERVAL_MS || '300000', 10), // 5 min (real-time)
    metrics: [
      'equipment_effectiveness_percent',
      'equipment_effectiveness_trend',
      'changeover_count_today',
      'work_in_process_units',
      'schedule_attainment_percent',
      'downtime_unplanned_minutes',
    ],
    dataPoints: {
      equipment_effectiveness_percent: { type: 'percentage', description: 'Current overall equipment effectiveness' },
      equipment_effectiveness_trend: { type: 'trend', description: 'Recent effectiveness trend' },
      changeover_count_today: { type: 'number', description: 'Changeovers completed today' },
      work_in_process_units: { type: 'number', description: 'Work-in-process units' },
      schedule_attainment_percent: { type: 'percentage', description: 'Execution versus plan' },
      downtime_unplanned_minutes: { type: 'number', description: 'Unexpected downtime today' },
    },
  },

  operations_system: {
    name: 'Operations System',
    capability: 'operations_system',
    adapter: 'ninety-io',
    vendor: 'ninety_io',
    defaultLabel: 'Operations System',
    enabled: !!process.env.NINETY_IO_API_KEY,
    description: 'Goal tracking, scorecards, accountability, and execution metrics',
    requiredEnvVars: ['NINETY_IO_API_KEY'],
    syncIntervalMs: parseInt(process.env.NINETY_IO_SYNC_INTERVAL_MS || '3600000', 10), // 1 hour
    metrics: [
      'goal_scorecard_health_percent',
      'goals_completion_percent',
      'goals_on_track_count',
      'goals_off_track_count',
      'goals_at_risk_count',
    ],
    dataPoints: {
      goal_scorecard_health_percent: { type: 'percentage', description: 'Health of organizational scorecard' },
      goals_completion_percent: { type: 'percentage', description: 'Progress against current goals' },
      goals_on_track_count: { type: 'number', description: 'Goals or owners on track' },
      goals_off_track_count: { type: 'number', description: 'Goals or owners off track' },
      goals_at_risk_count: { type: 'number', description: 'Goals flagged at risk' },
    },
  },

  // Template for future integrations:
  // new_capability: {
  //   name: 'Capability Name',
  //   capability: 'capability_key',
  //   adapter: 'vendor-adapter-file',
  //   vendor: 'vendor_slug',
  //   defaultLabel: 'Customer-facing Label',
  //   enabled: !!process.env.NEW_INTEGRATION_API_KEY,
  //   description: '...',
  //   requiredEnvVars: ['NEW_INTEGRATION_API_KEY', ...],
  //   syncIntervalMs: 3600000,
  //   metrics: ['metric1', 'metric2', ...],
  //   dataPoints: { /* describe each metric */ },
  // },
};

/**
 * Get all enabled integrations
 * @returns {Array} Array of {integrationId, config} objects
 */
function getEnabledIntegrations() {
  return Object.entries(INTEGRATION_REGISTRY)
    .filter(([, config]) => config.enabled)
    .map(([capabilityId, config]) => ({
      integrationId: capabilityId,
      config,
    }));
}

/**
 * Check if specific integration is enabled
 * @param {string} integrationId
 * @returns {boolean}
 */
function isIntegrationEnabled(integrationId) {
  return INTEGRATION_REGISTRY[integrationId]?.enabled || false;
}

/**
 * Validate required env vars for an integration
 * @param {string} integrationId
 * @returns {object} { valid: boolean, missing: string[] }
 */
function validateIntegrationConfig(integrationId) {
  const config = INTEGRATION_REGISTRY[integrationId];
  if (!config) {
    return { valid: false, missing: ['Integration not found in registry'] };
  }

  const missing = (config.requiredEnvVars || []).filter(envVar => !process.env[envVar]);

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Load adapter module for a capability
 * @param {string} integrationId
 * @returns {Function} Integration worker class
 */
function loadIntegration(integrationId, db) {
  const config = INTEGRATION_REGISTRY[integrationId];
  if (!config) {
    throw new Error(`Integration ${integrationId} not found in registry`);
  }

  try {
    const modulePath = `../integrations/${config.adapter}`;
    const integrationModule = require(modulePath);
    return integrationModule;
  } catch (err) {
    throw new Error(`Failed to load integration ${integrationId}: ${err.message}`);
  }
}

/**
 * Get registry info for logging/monitoring
 */
function getRegistryInfo() {
  return Object.entries(INTEGRATION_REGISTRY).map(([integrationId, config]) => ({
    integrationId,
    name: config.name,
    enabled: config.enabled,
    description: config.description,
    syncIntervalMs: config.syncIntervalMs,
    metricsCount: config.metrics.length,
  }));
}

module.exports = {
  INTEGRATION_REGISTRY,
  getEnabledIntegrations,
  isIntegrationEnabled,
  validateIntegrationConfig,
  loadIntegration,
  getRegistryInfo,
};
