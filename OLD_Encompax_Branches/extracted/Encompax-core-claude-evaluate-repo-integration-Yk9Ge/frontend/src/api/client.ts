/**
 * API base URL - uses /api for all environments
 * Vite dev server proxies /api requests to http://localhost:4000
 * In production, API and frontend are on same origin
 */
const API_BASE = '/api';

export async function fetchDatasources() {
 const res = await fetch(`${API_BASE}/datasources`);
 if (!res.ok) {
   throw new Error(`Failed to fetch datasources: ${res.status}`);
 }
 return res.json();
}

export async function createDatasource(payload: {
 name: string;
 type: string;
 description?: string;
}) {
 const res = await fetch(`${API_BASE}/datasources`, {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(payload),
 });
 if (!res.ok) {
   throw new Error(`Failed to create datasource: ${res.status}`);
 }
 return res.json();
}

// ── SIL (Shipment Intelligence Layer) ────────────────────────────────────────

const SIL_BASE = '/api/sil';

export async function fetchSilMetrics(from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const res = await fetch(`${SIL_BASE}/metrics?${params}`);
  if (!res.ok) throw new Error(`SIL metrics error: ${res.status}`);
  return res.json();
}

export async function fetchSilLiveFeed() {
  const res = await fetch(`${SIL_BASE}/live-feed`);
  if (!res.ok) throw new Error(`SIL live-feed error: ${res.status}`);
  return res.json();
}

export async function fetchSilInTransit() {
  const res = await fetch(`${SIL_BASE}/in-transit`);
  if (!res.ok) throw new Error(`SIL in-transit error: ${res.status}`);
  return res.json();
}

export async function fetchSilExceptions() {
  const res = await fetch(`${SIL_BASE}/exceptions`);
  if (!res.ok) throw new Error(`SIL exceptions error: ${res.status}`);
  return res.json();
}

export async function fetchSilWorkerStatus() {
  const res = await fetch(`${SIL_BASE}/worker-status`);
  if (!res.ok) throw new Error(`SIL worker-status error: ${res.status}`);
  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────

// ── Admin / Control Plane ─────────────────────────────────────────────────────

const ADMIN_BASE = '/api/admin';

export async function fetchAdminHealth() {
  const res = await fetch(`${ADMIN_BASE}/health`);
  return res.json();
}

export async function fetchProjects() {
  const res = await fetch(`${ADMIN_BASE}/projects`);
  if (!res.ok) throw new Error(`Failed to fetch projects: ${res.status}`);
  return res.json();
}

export async function createProject(payload: { name: string; slug: string; description?: string; color?: string }) {
  const res = await fetch(`${ADMIN_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create project: ${res.status}`);
  return res.json();
}

export async function fetchProject(id: string) {
  const res = await fetch(`${ADMIN_BASE}/projects/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch project: ${res.status}`);
  return res.json();
}

export async function updateProject(id: string, payload: { name?: string; description?: string; status?: string; color?: string }) {
  const res = await fetch(`${ADMIN_BASE}/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update project: ${res.status}`);
  return res.json();
}

export async function fetchIntegrations() {
  const res = await fetch(`${ADMIN_BASE}/integrations`);
  if (!res.ok) throw new Error(`Failed to fetch integrations: ${res.status}`);
  return res.json();
}

export async function createIntegration(payload: { projectId: string; name: string; type: string; configJson?: string }) {
  const res = await fetch(`${ADMIN_BASE}/integrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create integration: ${res.status}`);
  return res.json();
}

export async function updateIntegration(id: string, payload: { enabled?: boolean; configJson?: string; lastStatus?: string; lastMessage?: string }) {
  const res = await fetch(`${ADMIN_BASE}/integrations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update integration: ${res.status}`);
  return res.json();
}

export async function createWorkflow(payload: { projectId: string; name: string; description?: string; schedule?: string }) {
  const res = await fetch(`${ADMIN_BASE}/workflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create workflow: ${res.status}`);
  return res.json();
}

export async function updateWorkflow(id: string, payload: { name?: string; enabled?: boolean; schedule?: string }) {
  const res = await fetch(`${ADMIN_BASE}/workflows/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update workflow: ${res.status}`);
  return res.json();
}

export async function fetchRuns(workflowId: string) {
  const res = await fetch(`${ADMIN_BASE}/workflows/${workflowId}/runs`);
  if (!res.ok) throw new Error(`Failed to fetch runs: ${res.status}`);
  return res.json();
}

export async function triggerRun(workflowId: string) {
  const res = await fetch(`${ADMIN_BASE}/workflows/${workflowId}/runs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trigger: 'manual' }),
  });
  if (!res.ok) throw new Error(`Failed to trigger run: ${res.status}`);
  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────

export async function uploadFile(dataSourceId: number, file: File) {
 const formData = new FormData();
 formData.append('file', file);
 const res = await fetch(`${API_BASE}/uploads?dataSourceId=${dataSourceId}`, {
   method: "POST",
   body: formData,
 });
 if (!res.ok) {
   throw new Error(`Failed to upload file: ${res.status}`);
 }
 return res.json();
}