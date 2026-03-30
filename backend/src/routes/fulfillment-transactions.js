"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.registerFulfillmentRoutes = registerFulfillmentRoutes;

const express_1 = require("express");
const { getTenantConfig } = require("../config/tenant-config");

// Mock data representing real fulfillment workflow
const generateMockFulfillmentOrders = () => {
  const { customers, items, operators, locations } = getTenantConfig();
  const resolvedOperators = operators.length ? operators : ["Operator A", "Operator B", "Operator C"];
  const resolvedCustomers = customers.length ? customers : ["Customer Alpha", "Customer Beta", "Customer Gamma"];
  const resolvedItems = items.length
    ? items
    : [
        { sku: "SKU-1001", description: "Sample Item A" },
        { sku: "SKU-1002", description: "Sample Item B" },
        { sku: "SKU-2001", description: "Sample Item C" },
        { sku: "SKU-3001", description: "Sample Item D" },
      ];
  const resolvedLocations = locations.length ? locations : ["Site A", "Site B", "Site C"];

  const orders = [
    {
      sales_order_number: "ORD-001842",
      created_date: new Date(Date.now() - 4 * 60 * 60 * 1000),
      customer: resolvedCustomers[0],
      business_unit: "External",
      destination: resolvedLocations[0],
      line_items: [
        {
          line_number: 1,
          item_number: resolvedItems[0].sku,
          item_description: resolvedItems[0].description,
          quantity_requested: 12,
          quantity_allocated: 12,
          picking: {
            quantity_picked: 12,
            lot_number: "LOT-202603-SP5740-001",
            picked_by: resolvedOperators[0],
            picked_timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
            status: "picked",
          },
          verification: {
            quantity_verified: 12,
            verified_by: resolvedOperators[1] || resolvedOperators[0],
            verified_timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
            status: "verified",
          },
        },
      ],
    },
    {
      sales_order_number: "ORD-001843",
      created_date: new Date(Date.now() - 3.8 * 60 * 60 * 1000),
      customer: resolvedCustomers[1] || resolvedCustomers[0],
      business_unit: "External",
      destination: resolvedLocations[1] || resolvedLocations[0],
      line_items: [
        {
          line_number: 1,
          item_number: (resolvedItems[1] || resolvedItems[0]).sku,
          item_description: (resolvedItems[1] || resolvedItems[0]).description,
          quantity_requested: 8,
          quantity_allocated: 8,
          picking: {
            quantity_picked: 8,
            lot_number: "LOT-202603-SP5741-001",
            picked_by: resolvedOperators[0],
            picked_timestamp: new Date(Date.now() - 3.2 * 60 * 60 * 1000),
            status: "picked",
          },
          verification: {
            quantity_verified: 8,
            verified_by: resolvedOperators[2] || resolvedOperators[0],
            verified_timestamp: new Date(Date.now() - 2.9 * 60 * 60 * 1000),
            status: "verified",
          },
        },
      ],
    },
    {
      sales_order_number: "ORD-001844",
      created_date: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
      customer: resolvedCustomers[1] || resolvedCustomers[0],
      business_unit: "External",
      destination: resolvedLocations[2] || resolvedLocations[0],
      line_items: [
        {
          line_number: 1,
          item_number: (resolvedItems[2] || resolvedItems[0]).sku,
          item_description: (resolvedItems[2] || resolvedItems[0]).description,
          quantity_requested: 24,
          quantity_allocated: 24,
          picking: {
            quantity_picked: 24,
            lot_number: "LOT-202603-FG5001-050",
            picked_by: resolvedOperators[1] || resolvedOperators[0],
            picked_timestamp: new Date(Date.now() - 2.2 * 60 * 60 * 1000),
            status: "picked",
          },
          verification: null,
        },
      ],
    },
    {
      sales_order_number: "ORD-001845",
      created_date: new Date(Date.now() - 1.8 * 60 * 60 * 1000),
      customer: resolvedCustomers[0],
      business_unit: "External",
      destination: resolvedLocations[0],
      line_items: [
        {
          line_number: 1,
          item_number: (resolvedItems[3] || resolvedItems[0]).sku,
          item_description: (resolvedItems[3] || resolvedItems[0]).description,
          quantity_requested: 36,
          quantity_allocated: 36,
          picking: {
            quantity_picked: 36,
            lot_number: "LOT-202603-RM2401-012",
            picked_by: resolvedOperators[2] || resolvedOperators[0],
            picked_timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
            status: "picked",
          },
          verification: null,
        },
      ],
    },
    {
      sales_order_number: "ORD-001846",
      created_date: new Date(Date.now() - 1.2 * 60 * 60 * 1000),
      customer: resolvedCustomers[2] || resolvedCustomers[0],
      business_unit: "Internal",
      destination: "In-house staging",
      line_items: [
        {
          line_number: 1,
          item_number: resolvedItems[0].sku,
          item_description: resolvedItems[0].description,
          quantity_requested: 4,
          quantity_allocated: 4,
          picking: { status: "pending" },
          verification: null,
        },
      ],
    },
    {
      sales_order_number: "ORD-001847",
      created_date: new Date(Date.now() - 55 * 60 * 1000),
      customer: resolvedCustomers[1] || resolvedCustomers[0],
      business_unit: "External",
      destination: resolvedLocations[1] || resolvedLocations[0],
      backorder_reference: "ORD-001829",
      backorder_note: "Partial shipment from ORD-001829 (8 units shipped earlier, 8 units backlog)",
      line_items: [
        {
          line_number: 1,
          item_number: resolvedItems[0].sku,
          item_description: resolvedItems[0].description,
          quantity_requested: 8,
          quantity_allocated: 8,
          picking: {
            quantity_picked: 8,
            lot_number: "LOT-202602-SP5740-056",
            picked_by: resolvedOperators[0],
            picked_timestamp: new Date(Date.now() - 50 * 60 * 1000),
            status: "picked",
            notes: "Backlog from ORD-001829",
          },
          verification: null,
        },
      ],
    },
  ];

  return orders;
};

function registerFulfillmentRoutes(app) {
  const router = (0, express_1.Router)();

  router.get("/orders", async (req, res) => {
    try {
      const filterStatus = req.query.status;
      const filterCustomer = req.query.customer;

      const orders = generateMockFulfillmentOrders();
      let filtered = orders;

      if (filterCustomer) {
        filtered = filtered.filter((o) => o.customer.toLowerCase().includes(filterCustomer.toLowerCase()));
      }

      if (filterStatus) {
        filtered = filtered
          .map((order) => {
            const line_items = order.line_items.filter((line) => {
              if (filterStatus === "pending") {
                return !line.picking || line.picking.status === "pending";
              } else if (filterStatus === "picked") {
                return line.picking && line.picking.status === "picked" && !line.verification;
              } else if (filterStatus === "verified") {
                return line.verification && line.verification.status === "verified";
              }
              return true;
            });
            return { ...order, line_items };
          })
          .filter((o) => o.line_items.length > 0);
      }

      res.json({
        total_orders: filtered.length,
        pending_picks: filtered.reduce((sum, o) => sum + o.line_items.filter((l) => !l.picking || l.picking.status === "pending").length, 0),
        picked_awaiting_verification: filtered.reduce((sum, o) => sum + o.line_items.filter((l) => l.picking && !l.verification).length, 0),
        fully_verified: filtered.reduce((sum, o) => sum + o.line_items.filter((l) => l.verification && l.verification.status === "verified").length, 0),
        orders: filtered,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch fulfillment orders" });
    }
  });

  router.get("/orders/:sales_order_number", async (req, res) => {
    try {
      const { sales_order_number } = req.params;
      const orders = generateMockFulfillmentOrders();
      const order = orders.find((o) => o.sales_order_number === sales_order_number);

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order details" });
    }
  });

  router.post("/orders/:sales_order_number/pick", async (req, res) => {
    try {
      const { line_number, quantity_picked, lot_number, picked_by } = req.body;

      if (!line_number || quantity_picked === undefined || !picked_by) {
        return res.status(400).json({
          error: "Missing required fields: line_number, quantity_picked, picked_by",
        });
      }

      if (typeof quantity_picked !== "number" || quantity_picked < 0) {
        return res.status(400).json({
          error: "Invalid quantity_picked: must be a non-negative number",
        });
      }

      res.json({
        message: "Pick recorded",
        line_number,
        quantity_picked,
        lot_number: lot_number || null,
        picked_by,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to record pick" });
    }
  });

  app.use("/api/fulfillment", router);
}
