import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { config } from './lib/config';
import { registerHealthRoutes } from './routes/health';
import { registerDatasourceRoutes } from './routes/datasources';
import { registerJobRoutes } from './routes/jobs';
import { registerUploadRoutes } from './routes/uploads';
import { registerMetricsRoutes } from './routes/metrics';
import { errorHandler } from './middleware/errorHandler';
import { registerPickingRoutes } from './routes/picking';
const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload()); // handles multipart file uploads
registerHealthRoutes(app);
registerDatasourceRoutes(app);
registerJobRoutes(app);
registerUploadRoutes(app);
registerMetricsRoutes(app);
registerPickingRoutes(app);
app.use(errorHandler);
app.listen(config.port, () => {
 console.log(`Encompax-core API listening on port ${config.port}`);
});