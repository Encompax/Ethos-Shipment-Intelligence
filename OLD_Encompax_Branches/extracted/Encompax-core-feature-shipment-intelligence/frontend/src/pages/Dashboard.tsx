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

  const allTabs: { key: TabKey; label: string }[] = [
    { key: "studio", label: "Studio (Overview)" },
    ...visiblePanels.map((p) => ({ key: p.key, label: p.label })),
  ];

  return (
    <div className="dashboard-root">
      <header className="dashboard-header">
        <h1>Shipment Intelligence Dashboard</h1>
      </header>
      <nav className="dashboard-tabs">
        {allTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`tab-button${activeTab === tab.key ? " active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <section className="dashboard-content">
        {renderTabContent()}
      </section>
    </div>
  );
};

export default Dashboard;
