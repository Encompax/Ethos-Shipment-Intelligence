import express from "express";
import cors from "cors";
import { registerHealthRoutes } from "./routes/health";
import { registerDatasourceRoutes } from "./routes/datasources";
import { registerJobRoutes } from "./routes/jobs"; // we'll add this next
// later: import { registerUploadRoutes } from "./routes/uploads";
const app = express();
app.use(cors());
app.use(express.json());
// Register all route families
registerHealthRoutes(app);
registerDatasourceRoutes(app);
registerJobRoutes(app);
// registerUploadRoutes(app);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
 console.log(`Encompax-core API listening on port ${PORT}`);
});