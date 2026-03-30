import DataSourcesPanel from "../components/DataSourcesPanel";
import UploadPanel from "../components/UploadPanel";
import JobsPanel from "../components/JobsPanel";
import SourcingPanel from "../components/SourcingPanel";
import PlanningPanel from "../components/PlanningPanel";
import ProductAlignmentPanel from "../components/ProductAlignmentPanel";
import ProductionManagementPanel from "../components/ProductionManagementPanel";
import SupplyChainOptimizationPanel from "../components/SupplyChainOptimizationPanel";
import WarehouseManagementPanel from "../components/WarehouseManagementPanel";
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
 | "customer"
 | "eos"
 | "communication"
 | "marketing"
 | "references";
export type PanelConfig = {
 key: PanelKey;
 label: string;
 component: React.ComponentType;
 /** Should this appear as a card in the Studio/Overview grid? */
 showInOverview: boolean;
 /** Required permission strings; empty = visible to everyone logged in */
 requiredPermissions: string[];
};
export const PANEL_CONFIG: PanelConfig[] = [
 {
   key: "datasources",
   label: "Data Sources",
   component: DataSourcesPanel,
   showInOverview: true,
   requiredPermissions: ["datasources:view"],
 },
 {
   key: "uploads",
   label: "Uploads",
   component: UploadPanel,
   showInOverview: true,
   requiredPermissions: ["uploads:view"],
 },
 {
   key: "jobs",
   label: "Jobs",
   component: JobsPanel,
   showInOverview: true,
   requiredPermissions: ["jobs:view"],
 },
 {
   key: "sourcing",
   label: "Sourcing",
   component: SourcingPanel,
   showInOverview: true,
   requiredPermissions: ["sourcing:view"],
 },
 {
   key: "planning",
   label: "Planning",
   component: PlanningPanel,
   showInOverview: true,
   requiredPermissions: ["planning:view"],
 },
 {
   key: "productAlignment",
   label: "Product Alignment",
   component: ProductAlignmentPanel,
   showInOverview: true,
   requiredPermissions: ["productAlignment:view"],
 },
 {
   key: "production",
   label: "Production Mgmt",
   component: ProductionManagementPanel,
   showInOverview: true,
   requiredPermissions: ["production:view"],
 },
 {
   key: "supplyChainOpt",
   label: "Supply Chain Opt",
   component: SupplyChainOptimizationPanel,
   showInOverview: true,
   requiredPermissions: ["supplyChain:view"],
 },
 {
   key: "warehouse",
   label: "Warehouse Mgmt",
   component: WarehouseManagementPanel,
   showInOverview: true,
   requiredPermissions: ["warehouse:view"],
 },
 {
   key: "customer",
   label: "Customer Alignment",
   component: CustomerAlignmentPanel,
   showInOverview: true,
   requiredPermissions: ["customer:view"],
 },
 {
   key: "eos",
   label: "EOS",
   component: EOSPanel,
   showInOverview: true,
   requiredPermissions: ["eos:view"],
 },
 {
   key: "communication",
   label: "Communication",
   component: CommunicationPanel,
   showInOverview: true,
   requiredPermissions: ["communication:view"],
 },
 {
   key: "marketing",
   label: "Marketing Insights",
   component: MarketingInsightsPanel,
   showInOverview: true,
   requiredPermissions: ["marketing:view"],
 },
 {
   key: "references",
   label: "References",
   component: ReferencesPanel,
   showInOverview: true,
   requiredPermissions: ["references:view"],
 },
];