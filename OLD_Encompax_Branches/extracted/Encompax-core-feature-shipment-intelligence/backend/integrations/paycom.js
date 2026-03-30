/**
 * backend/integrations/paycom.js
 * 
 * Paycom adapter for the generic HRIS capability.
 *
 * Fetches workforce data from Paycom and normalizes it into platform-level
 * HR metrics that can be relabeled per customer.
 */

'use strict';

require('dotenv').config();
const axios = require('axios');
const IntegrationWorker = require('../lib/integration-worker');

const COMPANY_ID = process.env.PAYCOM_COMPANY_ID;

class PaycomIntegration extends IntegrationWorker {
  async sync() {
    const startTime = Date.now();
    
    try {
      this.log('Syncing HRIS data from adapter...');
      
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
   * Fetch workforce data from the current HRIS adapter.
   *
   * TODO: Implement the actual adapter API calls.
   */
  async fetchData() {
    this.log('Fetching workforce data from HRIS adapter (STUB)...');

    // TODO: Replace with actual Paycom API calls
    // const client = axios.create({
    //   baseURL: PAYCOM_BASE_URL,
    //   headers: { 'Authorization': `Bearer ${API_KEY}` },
    // });
    
    // const employees = await client.get('/employees', { params: { companyId: COMPANY_ID } });
    // return employees.data;

    // STUB: Return mock data for now
    return {
      employees: [
        { id: 1, name: 'John Doe', status: 'A', hireDate: '2020-01-15',department: 'Operations' },
        { id: 2, name: 'Jane Smith', status: 'A', hireDate: '2021-06-01', department: 'Finance' },
        // ... more employees
      ],
      company: { id: COMPANY_ID, name: 'Demo Customer' },
    };
  }

  /**
   * Normalize adapter data to generic HR metrics.
   * 
   * @param {object} data - raw HRIS adapter response
   * @returns {Array} metrics
   */
  normalizeToMetrics(data) {
    // STUB: Parse and calculate metrics
    const employees = data.employees || [];
    const activeEmployees = employees.filter(e => e.status === 'A');
    
    const metrics = [
      {
        metric_key: 'employee_count_active',
        value: activeEmployees.length,
        metadata: { department: 'All', status: 'active' },
      },
      {
        metric_key: 'employee_turnover_ytd',
        value: employees.filter(e => e.status === 'T').length, // T = terminated
        metadata: { year: new Date().getFullYear() },
      },
      {
        metric_key: 'labor_cost_per_employee',
        value: 125000, // TODO: Calculate from actual data
        metadata: { basis: 'annual_total_comp' },
      },
    ];

    return metrics;
  }
}

module.exports = PaycomIntegration;
