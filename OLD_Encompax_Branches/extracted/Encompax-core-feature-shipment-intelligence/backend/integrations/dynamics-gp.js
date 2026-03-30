/**
 * backend/integrations/dynamics-gp.js
 * 
 * Dynamics adapter for the generic ERP capability.
 *
 * Fetches customer, order, and financial data and normalizes it to shared
 * ERP metrics for the platform.
 */

'use strict';

require('dotenv').config();
const axios = require('axios');
const IntegrationWorker = require('../lib/integration-worker');

const TENANT_ID = process.env.DYNAMICS_GP_TENANT_ID;

class DynamicsGPIntegration extends IntegrationWorker {
  async sync() {
    const startTime = Date.now();
    
    try {
      this.log('Syncing ERP data from adapter...');
      
      const data = await this.fetchData();
      const metrics = this.normalizeToMetrics(data);
      this.saveMetrics(metrics);
      
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      this.log(`Sync complete in ${elapsed}s — ${metrics.length} metrics`);
    } catch (err) {
      this.error(`Sync failed: ${err.message}`);
      this.recordState('error', 0, err.message);
      throw err;
    }
  }

  /**
   * Fetch financial data from the current ERP adapter.
   *
   * TODO: Implement adapter API integration.
   */
  async fetchData() {
    this.log('Fetching financials from ERP adapter (STUB)...');

    // TODO: Replace with actual GP API calls
    // const client = axios.create({
    //   baseURL: GP_BASE_URL,
    //   headers: {
    //     'Authorization': `Bearer ${API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    // });
    
    // const [customers, invoices, salesOrders] = await Promise.all([
    //   client.get(`/companies/${TENANT_ID}/customers`),
    //   client.get(`/companies/${TENANT_ID}/salesInvoices`),
    //   client.get(`/companies/${TENANT_ID}/salesOrders`),
    // ]);
    
    // return { customers: customers.data, invoices: invoices.data, orders: salesOrders.data };

    // STUB: Return mock data
    return {
      ar_total: 2450000,
      ar_overdue_30_plus: 125000,
      customers_active: 287,
      revenue_mtd: 425000,
      revenue_ytd: 2100000,
      open_orders: 42,
    };
  }

  /**
   * Normalize ERP adapter data to generic ERP metrics.
   */
  normalizeToMetrics(data) {
    const metrics = [
      {
        metric_key: 'accounts_receivable_total',
        value: data.ar_total,
        metadata: { currency: 'USD' },
      },
      {
        metric_key: 'accounts_receivable_days_overdue',
        value: 28, // TODO: Calculate from actual invoice dates
        metadata: { threshold_days: 30 },
      },
      {
        metric_key: 'revenue_month_to_date',
        value: data.revenue_mtd,
        metadata: { month: new Date().getMonth() + 1 },
      },
      {
        metric_key: 'revenue_year_to_date',
        value: data.revenue_ytd,
        metadata: { year: new Date().getFullYear() },
      },
      {
        metric_key: 'customer_count_active',
        value: data.customers_active,
        metadata: { status: 'active' },
      },
      {
        metric_key: 'sales_orders_open_count',
        value: data.open_orders,
        metadata: { status: 'open' },
      },
    ];

    return metrics;
  }
}

module.exports = DynamicsGPIntegration;
