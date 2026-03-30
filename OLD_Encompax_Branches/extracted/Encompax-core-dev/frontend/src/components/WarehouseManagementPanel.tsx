import React from "react";
import { PickingTemplatePanel } from "./PickingTemplatePanel";
export const WarehouseManagementPanel: React.FC = () => {
 return (
<section>
<h2>Warehouse Management</h2>
<p>
       Dashboards for picking, packing, putaway, and slotting. Future widgets:
       pick rates, errors, space utilization, and task heatmaps.
<PickingTemplatePanel />
</p>
</section>
 );
};