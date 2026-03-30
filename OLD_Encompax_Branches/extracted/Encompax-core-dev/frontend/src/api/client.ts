const API_BASE = "/api";
export async function fetchDatasources() {
 const res = await fetch(`${API_BASE}/datasources`);
 if (!res.ok) {
   throw new Error("Failed to fetch datasources");
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
   throw new Error("Failed to create datasource");
 }
 return res.json();
}