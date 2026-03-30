import React, { useState } from "react";
import { ShipmentMetricsWidget } from "./warehouse/ShipmentMetricsWidget";
import { ExceptionsWidget } from "./warehouse/ExceptionsWidget";
import { InTransitWidget } from "./warehouse/InTransitWidget";
import { LiveFeedWidget } from "./warehouse/LiveFeedWidget";

type Tab = "metrics" | "exceptions" | "in-transit" | "live-feed";

const tabs: { key: Tab; label: string }[] = [
  { key: "metrics",     label: "Metrics" },
  { key: "exceptions",  label: "Exceptions" },
  { key: "in-transit",  label: "In Transit" },
  { key: "live-feed",   label: "Live Feed" },
];

const WarehouseManagementPanel: React.FC = () => {
  const [active, setActive] = useState<Tab>("metrics");

  return (
    <div>
      <div style={{ display: "flex", gap: "var(--space-xs)", marginBottom: "var(--space-md)", borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--space-sm)" }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            style={{
              padding: "var(--space-xs) var(--space-md)",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontSize: "var(--font-size-xs)",
              fontWeight: active === t.key ? "var(--font-weight-semibold)" : "var(--font-weight-normal)",
              background: active === t.key ? "var(--color-primary-bg)" : "transparent",
              color: active === t.key ? "var(--color-primary)" : "var(--color-text-secondary)",
              borderBottom: active === t.key ? "2px solid var(--color-primary)" : "2px solid transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {active === "metrics"    && <ShipmentMetricsWidget />}
      {active === "exceptions" && <ExceptionsWidget />}
      {active === "in-transit" && <InTransitWidget />}
      {active === "live-feed"  && <LiveFeedWidget />}
    </div>
  );
};

export default WarehouseManagementPanel;
