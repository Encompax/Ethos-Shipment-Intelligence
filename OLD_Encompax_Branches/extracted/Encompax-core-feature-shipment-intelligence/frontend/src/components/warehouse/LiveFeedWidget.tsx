import { useEffect, useState } from "react";
import { fetchSilLiveFeed } from "../../api/client";

interface ShipmentRow {
  id: string;
  tracking_number: string;
  carrier_name: string;
  carrier_service: string;
  ship_date: string;
  estimated_delivery: string;
  dest_name: string;
  dest_city: string;
  dest_state: string;
  weight_lbs: number;
  pack_qty: number;
  applied_cost: number;
  gp_order_number: string;
  gp_customer_id: string;
  is_hazmat: number;
  is_freight: number;
  status_code: number;
  starship_user: string;
  fedex_status: string;
  status_description: string;
  is_delivered: number;
  is_exception: number;
  actual_delivery: string;
}

function statusBadge(row: ShipmentRow) {
  if (row.is_exception) return <span className="badge badge-error">Exception</span>;
  if (row.is_delivered) return <span className="badge badge-success">Delivered</span>;
  if (row.status_code === 0) return <span className="badge badge-warning">Open</span>;
  if (row.status_code === 1) return <span className="badge badge-info">Processed</span>;
  return <span className="badge">{row.fedex_status || "—"}</span>;
}

export function LiveFeedWidget() {
  const [rows, setRows] = useState<ShipmentRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  function load() {
    setLoading(true);
    fetchSilLiveFeed()
      .then((d) => { setRows(d.shipments ?? []); setLastRefresh(new Date()); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000); // auto-refresh every 60s
    return () => clearInterval(interval);
  }, []);

  if (error) return <div style={{ color: "var(--color-error)", fontSize: "var(--font-size-sm)" }}>⚠ {error}</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-sm)" }}>
        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-light)" }}>
          {loading ? "Refreshing…" : lastRefresh ? `Updated ${lastRefresh.toLocaleTimeString()}` : ""}
        </span>
        <button className="btn btn-secondary btn-small" onClick={load} disabled={loading}>
          ↻ Refresh
        </button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Destination</th>
              <th>Carrier</th>
              <th>Ship Date</th>
              <th style={{ textAlign: "right" }}>Pkgs</th>
              <th style={{ textAlign: "right" }}>Cost</th>
              <th>Status</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td style={{ fontWeight: "var(--font-weight-medium)", whiteSpace: "nowrap" }}>
                  {row.gp_order_number || "—"}
                  {row.is_hazmat === 1 && <span className="badge badge-warning" style={{ marginLeft: "4px" }}>HZ</span>}
                  {row.is_freight === 1 && <span className="badge badge-info" style={{ marginLeft: "4px" }}>LTL</span>}
                </td>
                <td style={{ fontSize: "var(--font-size-xs)" }}>{row.gp_customer_id || "—"}</td>
                <td style={{ fontSize: "var(--font-size-xs)" }}>{row.dest_city}, {row.dest_state}</td>
                <td style={{ fontSize: "var(--font-size-xs)", whiteSpace: "nowrap" }}>
                  {row.carrier_name}<br />
                  <span style={{ color: "var(--color-text-light)" }}>{row.carrier_service}</span>
                </td>
                <td style={{ fontSize: "var(--font-size-xs)", whiteSpace: "nowrap" }}>
                  {row.ship_date ? new Date(row.ship_date).toLocaleDateString() : "—"}
                </td>
                <td style={{ textAlign: "right" }}>{row.pack_qty ?? "—"}</td>
                <td style={{ textAlign: "right" }}>
                  {row.applied_cost != null ? `$${row.applied_cost.toFixed(2)}` : "—"}
                </td>
                <td>{statusBadge(row)}</td>
                <td style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-light)" }}>{row.starship_user || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
