// backend/src/routes/admin.ts
// Control Plane admin API: projects, integrations, workflows, runs, health

import { Express, Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export function registerAdminRoutes(app: Express) {
  const router = Router();

  // ── Health ─────────────────────────────────────────────────────────────────

  router.get("/health", async (_req: Request, res: Response) => {
    const checks: Record<string, { status: string; message?: string }> = {};

    // Check DB
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = { status: "ok" };
    } catch (e: any) {
      checks.database = { status: "error", message: e.message };
    }

    // Check SIL (best-effort)
    try {
      const silUrl = process.env.SIL_URL || "http://localhost:3001";
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const r = await fetch(`${silUrl}/health`, { signal: controller.signal });
      clearTimeout(timeout);
      checks.sil = r.ok ? { status: "ok" } : { status: "error", message: `HTTP ${r.status}` };
    } catch {
      checks.sil = { status: "unreachable" };
    }

    const allOk = Object.values(checks).every((c) => c.status === "ok");
    res.status(allOk ? 200 : 207).json({
      overall: allOk ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      services: checks,
    });
  });

  // ── Projects ───────────────────────────────────────────────────────────────

  router.get("/projects", async (_req: Request, res: Response) => {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        integrations: { select: { id: true, name: true, type: true, enabled: true, lastStatus: true, lastSyncAt: true } },
        workflows: {
          select: {
            id: true, name: true, enabled: true,
            runs: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true, createdAt: true, finishedAt: true } },
          },
        },
      },
    });
    res.json(projects);
  });

  router.post("/projects", async (req: Request, res: Response) => {
    const { name, slug, description, color } = req.body;
    if (!name || !slug) return res.status(400).json({ message: "name and slug are required" });
    const project = await prisma.project.create({
      data: { name, slug, description: description ?? null, color: color ?? "#0B9BA8" },
    });
    res.status(201).json(project);
  });

  router.get("/projects/:id", async (req: Request, res: Response) => {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        integrations: true,
        workflows: {
          include: {
            runs: {
              orderBy: { createdAt: "desc" },
              take: 10,
              include: { events: { orderBy: { createdAt: "asc" } } },
            },
          },
        },
      },
    });
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  });

  router.put("/projects/:id", async (req: Request, res: Response) => {
    const { name, description, status, color } = req.body;
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { name, description, status, color },
    });
    res.json(project);
  });

  // ── Integrations ───────────────────────────────────────────────────────────

  router.get("/integrations", async (_req: Request, res: Response) => {
    const integrations = await prisma.integration.findMany({
      orderBy: { createdAt: "desc" },
      include: { project: { select: { id: true, name: true, slug: true } } },
    });
    res.json(integrations);
  });

  router.post("/integrations", async (req: Request, res: Response) => {
    const { projectId, name, type, configJson } = req.body;
    if (!projectId || !name || !type) {
      return res.status(400).json({ message: "projectId, name, and type are required" });
    }
    const integration = await prisma.integration.create({
      data: { projectId, name, type, configJson: configJson ?? "{}" },
    });
    res.status(201).json(integration);
  });

  router.put("/integrations/:id", async (req: Request, res: Response) => {
    const { enabled, configJson, lastStatus, lastMessage } = req.body;
    const integration = await prisma.integration.update({
      where: { id: req.params.id },
      data: {
        ...(enabled !== undefined && { enabled }),
        ...(configJson !== undefined && { configJson }),
        ...(lastStatus !== undefined && { lastStatus }),
        ...(lastMessage !== undefined && { lastMessage }),
        ...(lastStatus === "ok" && { lastSyncAt: new Date() }),
      },
    });
    res.json(integration);
  });

  // ── Workflows ──────────────────────────────────────────────────────────────

  router.post("/workflows", async (req: Request, res: Response) => {
    const { projectId, name, description, schedule, definitionJson } = req.body;
    if (!projectId || !name) {
      return res.status(400).json({ message: "projectId and name are required" });
    }
    const workflow = await prisma.workflow.create({
      data: {
        projectId, name,
        description: description ?? null,
        schedule: schedule ?? "manual",
        definitionJson: definitionJson ?? "{}",
      },
    });
    res.status(201).json(workflow);
  });

  router.put("/workflows/:id", async (req: Request, res: Response) => {
    const { name, description, enabled, schedule, definitionJson } = req.body;
    const workflow = await prisma.workflow.update({
      where: { id: req.params.id },
      data: { name, description, enabled, schedule, definitionJson },
    });
    res.json(workflow);
  });

  // ── Runs ───────────────────────────────────────────────────────────────────

  router.get("/workflows/:workflowId/runs", async (req: Request, res: Response) => {
    const runs = await prisma.run.findMany({
      where: { workflowId: req.params.workflowId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { events: { orderBy: { createdAt: "asc" } } },
    });
    res.json(runs);
  });

  router.post("/workflows/:workflowId/runs", async (req: Request, res: Response) => {
    const { trigger } = req.body;
    const run = await prisma.run.create({
      data: {
        workflowId: req.params.workflowId,
        status: "queued",
        trigger: trigger ?? "manual",
      },
      include: { events: true },
    });
    res.status(201).json(run);
  });

  router.put("/runs/:id", async (req: Request, res: Response) => {
    const { status, errorMessage, startedAt, finishedAt, durationMs } = req.body;
    const run = await prisma.run.update({
      where: { id: req.params.id },
      data: { status, errorMessage, startedAt, finishedAt, durationMs },
    });
    res.json(run);
  });

  router.post("/runs/:id/events", async (req: Request, res: Response) => {
    const { level, message, step, metaJson } = req.body;
    if (!message) return res.status(400).json({ message: "message is required" });
    const event = await prisma.runEvent.create({
      data: {
        runId: req.params.id,
        level: level ?? "info",
        message,
        step: step ?? null,
        metaJson: metaJson ?? "{}",
      },
    });
    res.status(201).json(event);
  });

  app.use("/api/admin", router);
}
