# Ethos Shipment Intelligence
Ethos Shipment Intelligence is the supply-chain and physical‑movement ERP ecosystem inside the Encompax family, operating under Encompax Core governance. It connects with the broader federation to provide end-to-end visibility and control across manufacturing and distribution workflows, while feeding data insight to Marengo and quality assurance signals to Kardia.

This repo was assembled from legacy Encompax branches and now contains the shipping intelligence stack as a standalone platform.

**What's Inside**
- `frontend`: Vite + React operations dashboard with warehouse and shipment intelligence panels.
- `backend`: Core API services and integrations.
- `backend/sil`: Shipment Intelligence Layer (SIL) with StarShip polling, FedEx enrichment, and shipment metrics APIs.
- `infra`: Firebase configuration (rules + project metadata).
- `INTEGRATION_ROADMAP.md`: Integration roadmap and governance-aligned connector strategy.

**Local Dev (Overview)**
- Frontend: `cd frontend && npm install && npm run dev`
- Backend: `cd backend && npm install && npm run dev`
- Shipment Intelligence Layer: `cd backend/sil && npm install && npm run dev`

If you want this trimmed further to only the shipping-specific UI and APIs (or renamed to align with Ethos branding throughout), say the word and I’ll refactor it.
