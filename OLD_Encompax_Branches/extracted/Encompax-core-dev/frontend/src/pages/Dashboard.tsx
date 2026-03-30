import React, { useState } from "react";
import {
 PANEL_CONFIG,
 PanelKey,
 PanelConfig,
} from "../config/panels";
type TabKey = "studio" | PanelKey;
const Dashboard: React.FC = () => {
 // TODO: wire to real auth later
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
     // Overview grid – multiple cards
     return (
<div
         style={{
           display: "grid",
           gap: "1rem",
           gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
           padding: "1rem",
         }}
>
         {visiblePanels
           .filter((p) => p.showInOverview)
           .map((panel) => {
             const PanelComponent = panel.component;
             return (
<div key={panel.key} style={panelStyle}>
<h2>{panel.label}</h2>
<PanelComponent />
</div>
             );
           })}
</div>
     );
   }
   // Full-screen view of a single panel
   const panel = visiblePanels.find((p) => p.key === activeTab);
   if (!panel) return <div>Not authorized for this view.</div>;
   const PanelComponent = panel.component;
   return (
<div style={{ padding: "1rem" }}>
<h1>{panel.label}</h1>
<PanelComponent />
</div>
   );
 };
 const allTabs: { key: TabKey; label: string }[] = [
   { key: "studio", label: "Studio (Overview)" },
   ...visiblePanels.map((p) => ({ key: p.key, label: p.label })),
 ];
 return (
<div>
<nav style={navStyle}>
       {allTabs.map((tab) => (
<button
           key={tab.key}
           onClick={() => setActiveTab(tab.key)}
           style={{
             ...tabButtonStyle,
             borderBottom:
               activeTab === tab.key ? "2px solid #0078d4" : "2px solid transparent",
             fontWeight: activeTab === tab.key ? 600 : 400,
           }}
>
           {tab.label}
</button>
       ))}
</nav>
<section>{renderTabContent()}</section>
</div>
 );
};
const panelStyle: React.CSSProperties = {
 border: "1px solid #e0e0e0",
 borderRadius: "8px",
 padding: "0.75rem",
 background: "#ffffff",
};
const navStyle: React.CSSProperties = {
 display: "flex",
 gap: "0.5rem",
 padding: "0.5rem 1rem",
 borderBottom: "1px solid #ddd",
};
const tabButtonStyle: React.CSSProperties = {
 background: "transparent",
 border: "none",
 padding: "0.5rem 0.75rem",
 cursor: "pointer",
};
export default Dashboard;
 