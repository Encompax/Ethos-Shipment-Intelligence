import { Express, Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

// Mock data generator for development
const generateMockCarrierMetrics = () => {
  const carriers = [
    {
      carrier_name: "FedEx Ground",
      shipment_count: 512,
      total_cost: 16840.32,
      avg_weight_lbs: 8.4,
      on_time_rate: 0.967,
      exception_rate: 0.023,
      trend: [
        { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), count: 68 },
        { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), count: 72 },
        { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), count: 81 },
        { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), count: 74 },
        { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), count: 63 },
        { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), count: 76 },
        { date: new Date(), count: 78 },
      ],
    },
    {
      carrier_name: "FedEx Express",
      shipment_count: 156,
      total_cost: 9852.45,
      avg_weight_lbs: 12.1,
      on_time_rate: 0.985,
      exception_rate: 0.013,
      trend: [
        { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), count: 18 },
        { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), count: 22 },
        { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), count: 24 },
        { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), count: 20 },
        { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), count: 19 },
        { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), count: 28 },
        { date: new Date(), count: 25 },
      ],
    },
    {
      carrier_name: "UPS",
      shipment_count: 128,
      total_cost: 5243.88,
      avg_weight_lbs: 9.7,
      on_time_rate: 0.953,
      exception_rate: 0.031,
      trend: [
        { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), count: 15 },
        { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), count: 18 },
        { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), count: 19 },
        { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), count: 17 },
        { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), count: 16 },
        { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), count: 21 },
        { date: new Date(), count: 22 },
      ],
    },
    {
      carrier_name: "FedEx Freight",
      shipment_count: 51,
      total_cost: 2584.85,
      avg_weight_lbs: 145.2,
      on_time_rate: 0.941,
      exception_rate: 0.039,
      trend: [
        { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), count: 6 },
        { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), count: 7 },
        { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), count: 8 },
        { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), count: 7 },
        { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), count: 6 },
        { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), count: 9 },
        { date: new Date(), count: 8 },
      ],
    },
  ];

  return {
    total_shipments: 847,
    total_cost: 34521.5,
    avg_shipment_cost: 40.75,
    carriers: carriers,
    cost_by_carrier: carriers.map((c) => ({
      name: c.carrier_name,
      value: Math.round(c.total_cost),
    })),
    volume_by_carrier: carriers.map((c) => ({
      name: c.carrier_name,
      value: c.shipment_count,
    })),
  };
};

// MOCK DATA — awaiting SIL SQLite (sil.db) integration.
// Replace with queries against the 'shipments' table populated by starshipPoller.
// See backend/sil/workers/starshipPoller.js for the schema.
export function registerCarrierRoutes(app: Express) {
  const router = Router();

  // GET /api/shipment/carriers/metrics
  // Returns carrier breakdown by volume, cost, performance metrics
  router.get("/metrics", async (req: Request, res: Response) => {
    try {
      // TODO: Query shipments from database
      // In Phase 2, this will connect to starshipPoller data in sil.db
      // For now, return mock data with realistic structure
      const metrics = generateMockCarrierMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch carrier metrics" });
    }
  });

  // GET /api/shipment/carriers/performance
  // Returns detailed performance by carrier (on-time, exceptions, etc.)
  router.get("/performance", async (req: Request, res: Response) => {
    try {
      const carrierData = generateMockCarrierMetrics();
      const performanceData = carrierData.carriers.map((c) => ({
        carrier: c.carrier_name,
        shipments: c.shipment_count,
        on_time_rate: c.on_time_rate,
        exception_rate: c.exception_rate,
        avg_weight: c.avg_weight_lbs,
        avg_cost: c.total_cost / c.shipment_count,
      }));
      res.json(performanceData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch performance data" });
    }
  });

  app.use("/api/shipment/carriers", router);
}
