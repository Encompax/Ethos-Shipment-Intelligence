import DataSourcesPanel from "../components/DataSourcesPanel";
import UploadPanel from "../components/UploadPanel";
import JobsPanel from "../components/JobsPanel";
import SourcingPanel from "../components/SourcingPanel";
import PlanningPanel from "../components/PlanningPanel";
import ProductAlignmentPanel from "../components/ProductAlignmentPanel";
import ProductionManagementPanel from "../components/ProductionManagementPanel";
import SupplyChainOptimizationPanel from "../components/SupplyChainOptimizationPanel";
import WarehouseManagementPanel from "../components/WarehouseManagementPanel";
import InventoryPanel from "../components/InventoryPanel";
import CustomerAlignmentPanel from "../components/CustomerAlignmentPanel";
import EOSPanel from "../components/EOSPanel";
import CommunicationPanel from "../components/CommunicationPanel";
import MarketingInsightsPanel from "../components/MarketingInsightsPanel";
import ReferencesPanel from "../components/ReferencesPanel";

export type PanelKey =
  | "datasources"
  | "uploads"
  | "jobs"
  | "sourcing"
  | "planning"
  | "productAlignment"
  | "production"
  | "supplyChainOpt"
  | "warehouse"
  | "inventory"
  | "customer"
  | "eos"
  | "communication"
  | "marketing"
  | "references";

export type PanelGroup =
  | "Operations"
  | "Logistics"
  | "Business"
  | "Tools";

export type PanelConfig = {
  key: PanelKey;
  label: string;
  group: PanelGroup;
  component: React.ComponentType;
  showInOverview: boolean;
  requiredPermissions: string[];
};

export const PANEL_CONFIG: PanelConfig[] = [
  // ── Operations ──────────────────────────────────────────────────────────
  {
    key: "sourcing",
    label: "Sourcing",
    group: "Operations",
    component: SourcingPanel,
    showInOverview: true,
    requiredPermissions: ["sourcing:view"],
  },
  {
    key: "planning",
    label: "Planning",
    group: "Operations",
    component: PlanningPanel,
    showInOverview: true,
    requiredPermissions: ["planning:view"],
  },
  {
    key: "production",
    label: "Production",
    group: "Operations",
    component: ProductionManagementPanel,
    showInOverview: true,
    requiredPermissions: ["production:view"],
  },
  {
    key: "supplyChainOpt",
    label: "Supply Chain",
    group: "Operations",
    component: SupplyChainOptimizationPanel,
    showInOverview: true,
    requiredPermissions: ["supplyChain:view"],
  },
  // ── Logistics ───────────────────────────────────────────────────────────
  {
    key: "warehouse",
    label: "Shipment Intelligence",
    group: "Logistics",
    component: WarehouseManagementPanel,
    showInOverview: true,
    requiredPermissions: ["warehouse:view"],
  },
  {
    key: "inventory",
    label: "Inventory",
    group: "Logistics",
    component: InventoryPanel,
    showInOverview: true,
    requiredPermissions: ["inventory:view"],
  },
  {
    key: "datasources",
    label: "Data Sources",
    group: "Logistics",
    component: DataSourcesPanel,
    showInOverview: true,
    requiredPermissions: ["datasources:view"],
  },
  {
    key: "uploads",
    label: "Uploads",
    group: "Logistics",
    component: UploadPanel,
    showInOverview: true,
    requiredPermissions: ["uploads:view"],
  },
  {
    key: "jobs",
    label: "Jobs",
    group: "Logistics",
    component: JobsPanel,
    showInOverview: true,
    requiredPermissions: ["jobs:view"],
  },
  // ── Business ────────────────────────────────────────────────────────────
  {
    key: "customer",
    label: "Customer",
    group: "Business",
    component: CustomerAlignmentPanel,
    showInOverview: true,
    requiredPermissions: ["customer:view"],
  },
  {
    key: "productAlignment",
    label: "Product Alignment",
    group: "Business",
    component: ProductAlignmentPanel,
    showInOverview: true,
    requiredPermissions: ["productAlignment:view"],
  },
  {
    key: "eos",
    label: "EOS",
    group: "Business",
    component: EOSPanel,
    showInOverview: true,
    requiredPermissions: ["eos:view"],
  },
  {
    key: "marketing",
    label: "Marketing",
    group: "Business",
    component: MarketingInsightsPanel,
    showInOverview: true,
    requiredPermissions: ["marketing:view"],
  },
  // ── Tools ────────────────────────────────────────────────────────────────
  {
    key: "communication",
    label: "Communication",
    group: "Tools",
    component: CommunicationPanel,
    showInOverview: true,
    requiredPermissions: ["communication:view"],
  },
  {
    key: "references",
    label: "References",
    group: "Tools",
    component: ReferencesPanel,
    showInOverview: true,
    requiredPermissions: ["references:view"],
  },
];

export const PANEL_GROUPS: PanelGroup[] = ["Operations", "Logistics", "Business", "Tools"];
