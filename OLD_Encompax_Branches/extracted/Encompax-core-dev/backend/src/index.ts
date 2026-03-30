import express from "express";
import cors from "cors";
import { config } from "./lib/config";
import { registerHealthRoutes } from "./routes/health";
import { registerDatasourceRoutes } from "./routes/datasources";
import { registerJobRoutes } from "./routes/jobs";
import { registerPickingRoutes } from "./routes/picking";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

registerHealthRoutes(app);
registerDatasourceRoutes(app);
registerJobRoutes(app);
registerPickingRoutes(app);

app.use(errorHandler);

app.listen(config.port, () => {
 console.log(`Encompax-core API listening on port ${config.port}`);
});
