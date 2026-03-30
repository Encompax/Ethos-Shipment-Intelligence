import express from "express";
import cors from "cors";
import { registerHealthRoutes } from "./routes/health";
import { registerDatasourceRoutes } from "./routes/datasources";
import { registerJobRoutes } from "./routes/jobs";
import { registerPickingRoutes } from "./routes/picking";

const app = express();

// CORS configuration - allow all origins for development
app.use(cors({
  origin: true, // Allow any origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Register all route families
registerHealthRoutes(app);
registerDatasourceRoutes(app);
registerJobRoutes(app);
registerPickingRoutes(app);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
 console.log(`Encompax-core API listening on port ${PORT}`);
});