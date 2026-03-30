// backend/src/routes/picking.ts
import { Express, Router } from "express";
export function registerPickingRoutes(app: Express) {
 const router = Router();
 // Temporary stub: later this will query Prisma and build a real plan
 router.get("/plan", async (req, res) => {
   const samplePlan = [
     {
       orderNumber: "ORD1001",
       itemNumber: "ITEM-001",
       description: "Sample Buffer A",
       qtyToPick: 3,
       location: "A01-01-01-01",
       barcodeValue: "ORD1001",
     },
     {
       orderNumber: "ORD1002",
       itemNumber: "ITEM-002",
       description: "Sample Reagent B",
       qtyToPick: 1,
       location: "A01-01-02-01",
       barcodeValue: "ORD1002",
     },
   ];
   res.json(samplePlan);
 });
 app.use("/api/picking", router);
}