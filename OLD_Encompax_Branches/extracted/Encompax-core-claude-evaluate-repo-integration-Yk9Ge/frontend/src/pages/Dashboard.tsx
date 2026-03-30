import React, { useState } from "react";
import {
  PANEL_CONFIG,
  PanelKey,
  PanelConfig,
} from "../config/panels";

type TabKey = "studio" | PanelKey;

const Dashboard: React.FC = () => {
  const currentUserPermissions: string[] = [
    "datasources:view",
    "uploads:view",
    "jobs:view",
    "sourcing:view",
    "planning:view",
    "productAlignment:view",
    "production:view",
    "supplyChain:view",
    "warehouse:view",
    "customer:view",
    "eos:view",
    "communication:view",
    "marketing:view",
    "references:view",
  ];

  const hasPermission = (panel: PanelConfig) =>
    panel.requiredPermissions.length === 0 ||
    panel.requiredPermissions.every((p) =>
      currentUserPermissions.includes(p)
    );

  const visiblePanels = PANEL_CONFIG.filter(hasPermission);
  const [activeTab, setActiveTab] = useState<TabKey>("studio");

  const renderTabContent = () => {
    if (activeTab === "studio") {
      return (
        <div className="panel-grid">
          {visiblePanels
            .filter((p) => p.showInOverview)
            .map((panel) => {
              const PanelComponent = panel.component;
              return (
                <div key={panel.key} className="panel">
                  <div className="panel-header">
                    <h2 className="panel-title">{panel.label}</h2>
                  </div>
                  <div className="panel-body">
                    <PanelComponent />
                  </div>
                </div>
              );
            })}
        </div>
      );
    }

    const panel = visiblePanels.find((p) => p.key === activeTab);
    if (!panel) return <div>Not authorized for this view.</div>;
    const PanelComponent = panel.component;
    return (
      <div className="panel">
        <div className="panel-header">
          <h1 className="panel-title">{panel.label}</h1>
        </div>
        <div className="panel-body">
          <PanelComponent />
        </div>
      </div>
    );
  };

  // Split tabs: Control Plane is pinned left, rest follow Studio
  const controlPlanePanel = visiblePanels.find((p) => p.key === "controlplane");
  const operationsPanels = visiblePanels.filter((p) => p.key !== "controlplane");

  const allTabs: { key: TabKey; label: string; isPinned?: boolean }[] = [
    ...(controlPlanePanel ? [{ key: controlPlanePanel.key, label: controlPlanePanel.label, isPinned: true }] : []),
    { key: "studio", label: "Studio (Overview)" },
    ...operationsPanels.map((p) => ({ key: p.key, label: p.label })),
  ];

  return (
    <div className="dashboard-root">
      <header className="dashboard-header">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <h1>Encompax</h1>
          <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", fontWeight: 400 }}>
            Operations Platform
          </span>
        </div>
      </header>
      <nav className="dashboard-tabs">
        {allTabs.map((tab, idx) => (
          <React.Fragment key={tab.key}>
            {/* Divider between Control Plane and the rest */}
            {idx === 1 && controlPlanePanel && (
              <span style={{ width: 1, height: 20, background: "var(--color-border)", alignSelf: "center", margin: "0 4px" }} />
            )}
            <button
              onClick={() => setActiveTab(tab.key)}
              className={`tab-button${activeTab === tab.key ? " active" : ""}${tab.isPinned ? " tab-pinned" : ""}`}
            >
              {tab.isPinned ? "⚙ " : ""}{tab.label}
            </button>
          </React.Fragment>
        ))}
      </nav>
      <section className="dashboard-content">
        {renderTabContent()}
      </section>
    </div>
  );
};

export default Dashboard;
