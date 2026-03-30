-- Control Plane Models: Project, Integration, Workflow, Run, RunEvent

CREATE TABLE "Project" (
    "id"          TEXT NOT NULL PRIMARY KEY,
    "name"        TEXT NOT NULL,
    "slug"        TEXT NOT NULL,
    "description" TEXT,
    "status"      TEXT NOT NULL DEFAULT 'active',
    "color"       TEXT NOT NULL DEFAULT '#0B9BA8',
    "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   DATETIME NOT NULL
);
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

CREATE TABLE "Integration" (
    "id"          TEXT NOT NULL PRIMARY KEY,
    "projectId"   TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "type"        TEXT NOT NULL,
    "enabled"     BOOLEAN NOT NULL DEFAULT true,
    "configJson"  TEXT NOT NULL DEFAULT '{}',
    "lastSyncAt"  DATETIME,
    "lastStatus"  TEXT,
    "lastMessage" TEXT,
    "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   DATETIME NOT NULL,
    CONSTRAINT "Integration_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Workflow" (
    "id"             TEXT NOT NULL PRIMARY KEY,
    "projectId"      TEXT NOT NULL,
    "name"           TEXT NOT NULL,
    "description"    TEXT,
    "definitionJson" TEXT NOT NULL DEFAULT '{}',
    "enabled"        BOOLEAN NOT NULL DEFAULT true,
    "schedule"       TEXT,
    "createdAt"      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      DATETIME NOT NULL,
    CONSTRAINT "Workflow_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Run" (
    "id"           TEXT NOT NULL PRIMARY KEY,
    "workflowId"   TEXT NOT NULL,
    "status"       TEXT NOT NULL DEFAULT 'queued',
    "trigger"      TEXT NOT NULL DEFAULT 'manual',
    "startedAt"    DATETIME,
    "finishedAt"   DATETIME,
    "durationMs"   INTEGER,
    "errorMessage" TEXT,
    "createdAt"    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Run_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "RunEvent" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "runId"     TEXT NOT NULL,
    "level"     TEXT NOT NULL DEFAULT 'info',
    "message"   TEXT NOT NULL,
    "step"      TEXT,
    "metaJson"  TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RunEvent_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
