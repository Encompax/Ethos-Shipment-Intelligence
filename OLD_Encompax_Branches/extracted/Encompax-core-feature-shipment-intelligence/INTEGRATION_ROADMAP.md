# Integration Architecture & Roadmap

## Overview

Encompax-core should act as a **unified integration and data-governance layer** for multiple products and multiple customers. Instead of being built around one company's software stack, the platform should support a configurable connector model where each customer can enable the systems they use, map their fields, and control sync behavior without changing core application code.

The goal is simple:

- connect customer systems through reusable adapters
- normalize incoming operational data into shared platform models
- expose consistent APIs to downstream dashboards and products
- support customer-specific mappings, permissions, and schedules in configuration

---

## Strategic Value

### Why Build a Universal Integration Layer?

1. **Eliminate Data Silos**
   - Customers often operate across ERP, WMS, TMS, HR, CRM, finance, and collaboration tools.
   - A shared integration layer creates one governed source of operational truth.

2. **Support Customer Variability Without Forking**
   - Customer A may use NetSuite and UKG.
   - Customer B may use Dynamics, QuickBooks, or a custom warehouse system.
   - The platform should adapt through connector configuration, not one-off rewrites.

3. **Enable Reusable Products**
   - Shipment Intelligence, planning tools, operations dashboards, and future products can all consume the same normalized data layer.
   - Frontends should not care whether the source was SAP, CSV upload, or a REST API.

4. **Improve Governance**
   - Central logging, sync auditing, role-aware access, and retention rules stay in one place.
   - Sensitive data handling can be enforced consistently across customers.

5. **Reduce Manual Work**
   - Fewer custom scripts, spreadsheet exports, and ad hoc imports.
   - Faster onboarding for each new customer because the framework already exists.

---

## Integration Principles

### Platform Rules

- Core code stays generic.
- Customer-specific logic lives in configuration and mappings.
- Every integration is read-only by default unless a write-back use case is explicitly approved.
- Every connector must declare what it reads, how often it syncs, and which normalized entities it updates.
- All sync activity must be auditable.

### Customer Configuration Model

Each customer should be able to define:

- which integrations are enabled
- auth method and credential references
- source-specific field mappings
- sync frequency and rate limits
- alerting and webhook preferences
- tenant-specific filters, business rules, and exclusions

---

## Target Integration Categories

### Phase 1 — Foundation

- File ingestion connectors
  - CSV
  - Excel
  - SFTP drops
- Generic REST connector framework
- Webhook ingestion framework
- Shipment Intelligence feed into normalized logistics models

### Phase 2 — Core Business Systems

- ERP connectors
  - examples: Dynamics, NetSuite, SAP, QuickBooks, custom ERP
- HRIS connectors
  - examples: UKG, BambooHR, Paycom, ADP
- CRM / revenue connectors
  - examples: Salesforce, HubSpot, custom sales systems

### Phase 3 — Operations & Execution Systems

- WMS connectors
- TMS / carrier connectors
- MES / production systems
- procurement and supplier systems

### Phase 4 — Collaboration & Knowledge Systems

- Microsoft Graph
- Google Workspace
- document repositories
- communication and alerting channels

---

## Architecture

### 1. Integration Registry

The platform should maintain a central registry of reusable connector definitions.

```javascript
// backend/config/integrations.js
const INTEGRATION_REGISTRY = {
  generic_rest: {
    name: "Generic REST Connector",
    category: "api",
    authModes: ["api_key", "oauth2", "basic"],
    supportsWebhooks: false,
    configurable: true,
  },

  erp_connector: {
    name: "ERP Connector",
    category: "erp",
    authModes: ["api_key", "oauth2", "service_account"],
    supportsWebhooks: true,
    configurable: true,
  },

  hris_connector: {
    name: "HRIS Connector",
    category: "hr",
    authModes: ["api_key", "oauth2"],
    supportsWebhooks: false,
    configurable: true,
  },

  shipment_intelligence: {
    name: "Shipment Intelligence Feed",
    category: "logistics",
    authModes: ["api_key", "service_account"],
    supportsWebhooks: true,
    configurable: true,
  },
};
```

### 2. Tenant-Aware Integration Configuration

Each customer should have its own integration records and mapping rules.

```sql
CREATE TABLE tenant_integrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  integration_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT 0,
  auth_type TEXT NOT NULL,
  credential_ref TEXT NOT NULL,
  base_url TEXT,
  sync_interval_seconds INTEGER,
  config_json JSON,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE tenant_field_mappings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  integration_key TEXT NOT NULL,
  source_entity TEXT NOT NULL,
  source_field TEXT NOT NULL,
  target_entity TEXT NOT NULL,
  target_field TEXT NOT NULL,
  transform_rule TEXT,
  is_required BOOLEAN DEFAULT 0
);
```

### 3. Normalization Layer

Raw source data should be transformed into normalized platform entities and metrics.

```sql
CREATE TABLE metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  source TEXT NOT NULL,
  metric_key TEXT NOT NULL,
  value REAL,
  value_text TEXT,
  timestamp TEXT DEFAULT (datetime('now')),
  synced_at TEXT,
  metadata JSON,
  UNIQUE(tenant_id, source, metric_key, timestamp)
);
```

Example normalized metrics:

- `headcount_total`
- `revenue_mtd`
- `orders_open`
- `shipments_in_transit`
- `otif_percent`
- `inventory_days_on_hand`

### 4. Worker Pattern

Each integration runs through the same sync lifecycle:

1. load tenant config
2. authenticate
3. fetch source records
4. apply field mappings
5. normalize entities and metrics
6. store data and sync state
7. emit audit logs

```javascript
class GenericSyncWorker extends Worker {
  async poll() {
    const config = await this.loadTenantIntegrationConfig();
    const records = await this.fetchSourceRecords(config);
    const mapped = this.applyFieldMappings(records, config.fieldMappings);
    const metrics = this.normalizeToMetrics(mapped, config.normalizationRules);
    await this.saveMetrics(metrics);
    await this.saveSyncState();
  }
}
```

---

## Frontend Direction

Frontend products should consume normalized APIs, not vendor-specific endpoints.

### Product Rule

- Product dashboards query platform endpoints like `/api/metrics`, `/api/entities`, and `/api/integrations/status`
- Product UIs should not know or care which customer systems produced the data
- Customer branding, enabled widgets, and available metrics should be configurable

### Example Widget

```jsx
<MetricCard
  source="erp"
  metricKey="revenue_mtd"
  title="Revenue MTD"
  trend={true}
  format="currency"
/>
```

### Dashboard Builder

The dashboard builder should eventually support:

- per-tenant templates
- per-role layouts
- per-user saved dashboards
- widget permissions
- customer-specific naming and labels

---

## Security & Governance

### Credential Handling

- store secrets outside git
- use secret references rather than raw values in config
- support secret rotation
- prefer read-only scopes

### Data Minimization

- only sync the fields required for analytics or workflow use cases
- support field-level suppression for sensitive data
- separate raw ingestion from normalized access where needed

### Audit Logging

```sql
CREATE TABLE integration_audits (
  id INTEGER PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  integration_key TEXT NOT NULL,
  action TEXT,
  status TEXT,
  records_synced INTEGER,
  error_message TEXT,
  timestamp TEXT
);
```

### Rate Limiting

Rate limits should be configurable per connector and per tenant.

Examples:

- max requests per minute
- batch size
- retry windows
- backoff policy

---

## Example API Endpoints

```javascript
GET /api/integrations
GET /api/integrations/:integrationKey/status
GET /api/metrics/:source
GET /api/metrics/:source/:metricKey?from=2026-03-01&to=2026-03-12
GET /api/metrics/trending?period=7d
POST /api/tenants/:tenantId/integrations
PATCH /api/tenants/:tenantId/integrations/:integrationKey
POST /api/tenants/:tenantId/integrations/:integrationKey/sync
GET /api/tenants/:tenantId/field-mappings
POST /api/dashboards
GET /api/dashboards/:id
```

---

## CLI / Operational Tooling

```bash
# Check integration status
npm run inspect:integrations

# Run a tenant-specific sync
npm run sync:integration -- --tenant=tenant_a --integration=erp_connector --force

# Query metrics
npm run query:metrics -- --tenant=tenant_a --source=erp --metric=revenue_mtd
```

---

## Implementation Roadmap

### Phase 1 Checklist

- [ ] Create integration registry
- [ ] Create tenant integration configuration model
- [ ] Create tenant field mappings model
- [ ] Create base sync worker class
- [ ] Create metrics schema with `tenant_id`
- [ ] Create integration audit schema
- [ ] Create `/api/integrations` and `/api/metrics` endpoints
- [ ] Build one generic REST connector
- [ ] Build one file-ingestion connector
- [ ] Route Shipment Intelligence data through normalized APIs

### Phase 2 Checklist

- [ ] Add ERP connector template
- [ ] Add HRIS connector template
- [ ] Add CRM connector template
- [ ] Add webhook ingestion support
- [ ] Build integration admin UI for tenant configs
- [ ] Build field mapping UI
- [ ] Build dashboard widgets from normalized metrics

### Phase 3 Checklist

- [ ] Add connector health monitoring
- [ ] Add retry, dead-letter, and replay workflows
- [ ] Add role-based metric visibility
- [ ] Add customer-specific dashboard templates
- [ ] Add write-back support for approved use cases

---

## Questions to Clarify Per Customer

1. **Which systems are in scope?**
   - ERP
   - HRIS
   - CRM
   - WMS/TMS
   - file-based sources
   - custom/internal tools

2. **How should each system authenticate?**
   - OAuth2
   - API key
   - service account
   - database connection
   - file drop / SFTP

3. **Which entities and metrics matter most?**
   - orders
   - shipments
   - inventory
   - labor
   - revenue
   - service levels

4. **What sync model is required?**
   - scheduled polling
   - near real-time polling
   - webhooks
   - manual upload only

5. **What restrictions apply?**
   - data residency
   - retention requirements
   - restricted fields
   - department-level access

---

## Recommended Product Boundary

If Shipment Intelligence is becoming a reusable product for multiple customers, it should not remain only as a long-lived feature branch inside Encompax-core.

Recommended split:

- `Encompax-core`
  - shared auth
  - integration framework
  - data governance
  - normalized APIs
  - tenant configuration
- `shipment-intelligence`
  - customer-facing dashboard
  - shipment-specific widgets and workflows
  - product branding and templates
  - optional customer-specific presentation layer

This keeps Encompax-core focused on platform responsibilities while allowing Shipment Intelligence to evolve as a standalone product in the ecosystem.
