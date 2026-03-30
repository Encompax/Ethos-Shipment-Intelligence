import { Express, Request, Response } from "express";
import { config } from "../lib/config";
import path from "path";
import fs from "fs";

type UploadedFile = {
 name: string;
 mimetype: string;
 size: number;
 mv: (destination: string) => Promise<void>;
};

type UploadRequest = Request & {
 files?: Record<string, UploadedFile | UploadedFile[]>;
};

export function registerUploadRoutes(app: Express) {
 app.post("/api/ingest/upload", async (req: Request, res: Response) => {
   const uploadReq = req as UploadRequest;
   const dataSourceId = Number(req.body.dataSourceId);
   const candidate = uploadReq.files?.file;
   const file = Array.isArray(candidate) ? candidate[0] : candidate;

   if (!dataSourceId || !file) {
     return res.status(400).json({ message: "dataSourceId and file are required" });
   }

   const uploadDir = path.join(process.cwd(), config.uploadDir);
   if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

   const storedFileName = `${Date.now()}_${path.basename(file.name)}`;
   const storedPath = path.join(uploadDir, storedFileName);

   await file.mv(storedPath);

   // Upload persistence is intentionally filesystem-only on this baseline branch.
   // Later branches introduce richer job tracking models that can be merged in deliberately.
   res.status(201).json({
     dataSourceId,
     status: "stored",
     upload: {
       originalName: file.name,
       storedFileName,
       storedPath,
       sizeBytes: file.size,
       contentType: file.mimetype,
     },
   });
 });
}
