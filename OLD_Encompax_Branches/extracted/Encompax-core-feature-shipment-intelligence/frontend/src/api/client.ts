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