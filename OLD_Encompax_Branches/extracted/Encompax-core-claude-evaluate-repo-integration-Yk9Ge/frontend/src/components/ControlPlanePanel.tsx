// frontend/src/components/ControlPlanePanel.tsx
// Encompax Control Plane — project hub, integrations, workflows, run timeline

import React, { useEffect, useState, useCallback } from "react";
import "./ControlPlanePanel.css";
import {
  fetchAdminHealth,
  fetchProjects,
  createProject,
  fetchProject,
  updateProject,
  createIntegration,
  updateIntegration,
  createWorkflow,
  updateWorkflow,
  fetchRuns,
  triggerRun,
} from "../api/client";

// ── Types ─────────────────────────────────────────────────────────────────────

interface HealthService {
  status: "ok" | "error" | "unreachable" | "degraded";
  message?: string;
}
interface HealthResult {
  overall: string;
  timestamp: string;
  services: Record<string, HealthService>;
}

interface Integration {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  lastStatus: string | null;
  lastSyncAt: string | null;
  lastMessage: string | null;
  project?: { id: string; name: string; slug: string };
}

interface RunEvent {
  id: string;
  level: string;
  message: string;
  step: string | null;
  createdAt: string;
}

interface Run {
  id: string;
  status: string;
  trigger: string;
  startedAt: string | null;
  finishedAt: string | null;
  durationMs: number | null;
  errorMessage: string | null;
  createdAt: string;
  events: RunEvent[];
}

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  enabled: boolean;
  schedule: string | null;
  runs: Run[];
}

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  color: string;
  createdAt: string;
  integrations: Integration[];
  workflows: Workflow[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  ok: "var(--color-success)",
  active: "var(--color-success)",
  error: "var(--color-error)",
  failed: "var(--color-error)",
  unreachable: "var(--color-error)",
  degraded: "var(--color-warning)",
  warning: "var(--color-warning)",
  running: "var(--color-info)",
  queued: "var(--color-text-secondary)",
  paused: "var(--color-warning)",
  archived: "var(--color-text-light)",
  succeeded: "var(--color-success)",
  cancelled: "var(--color-text-secondary)",
};

const EVENT_COLORS: Record<string, string> = {
  info: "var(--color-info)",
  warn: "var(--color-warning)",
  error: "var(--color-error)",
  success: "var(--color-success)",
};

function StatusDot({ status }: { status: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: STATUS_COLORS[status] ?? "var(--color-text-light)",
        marginRight: 6,
        flexShrink: 0,
      }}
    />
  );
}

function Badge({ label, status }: { label: string; status: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 12,
        fontSize: "var(--font-size-xs)",
        fontWeight: "var(--font-weight-medium)",
        backgroundColor: `color-mix(in srgb, ${STATUS_COLORS[status] ?? "#888"} 12%, transparent)`,
        color: STATUS_COLORS[status] ?? "var(--color-text-secondary)",
        border: `1px solid color-mix(in srgb, ${STATUS_COLORS[status] ?? "#888"} 25%, transparent)`,
        textTransform: "capitalize",
        gap: 4,
      }}
    >
      <StatusDot status={status} />
      {label}
    </span>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      style={{
        position: "relative",
        width: 40,
        height: 22,
        borderRadius: 11,
        border: "none",
        cursor: "pointer",
        backgroundColor: enabled ? "var(--color-primary)" : "var(--color-border)",
        transition: "background-color 0.2s",
        flexShrink: 0,
      }}
      title={enabled ? "Click to disable" : "Click to enable"}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: enabled ? 21 : 3,
          width: 16,
          height: 16,
          borderRadius: "50%",
          backgroundColor: "#fff",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
}

function formatDuration(ms: number | null): string {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

function formatRelative(iso: string | null): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(iso).toLocaleDateString();
}

const INTEGRATION_TYPES = [
  "starship", "fedex", "karrio", "dynamics-gp", "paycom", "velocity", "ninety-io", "custom"
];

// ── Sub-components ────────────────────────────────────────────────────────────

function HealthStrip({ health, onRefresh }: { health: HealthResult | null; onRefresh: () => void }) {
  if (!health) {
    return (
      <div className="cp-health-strip">
        <span style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)" }}>
          Loading system health...
        </span>
      </div>
    );
  }
  return (
    <div className="cp-health-strip">
      <span className="cp-health-label">System Health:</span>
      <Badge label={health.overall} status={health.overall === "ok" ? "ok" : "degraded"} />
      {Object.entries(health.services).map(([svc, info]) => (
        <span key={svc} className="cp-health-service">
          <StatusDot status={info.status} />
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
            {svc}
          </span>
          {info.message && (
            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-error)" }}>
              &nbsp;({info.message})
            </span>
          )}
        </span>
      ))}
      <button className="cp-btn-ghost" onClick={onRefresh} style={{ marginLeft: "auto" }}>
        ↺ Refresh
      </button>
    </div>
  );
}

function RunTimeline({ runs }: { runs: Run[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  if (!runs.length) {
    return <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)" }}>No runs yet.</p>;
  }
  return (
    <div className="cp-run-list">
      {runs.map((run) => (
        <div key={run.id} className="cp-run-row">
          <div
            className="cp-run-header"
            onClick={() => setExpanded(expanded === run.id ? null : run.id)}
          >
            <StatusDot status={run.status} />
            <span className="cp-run-id">#{run.id.slice(-6)}</span>
            <Badge label={run.status} status={run.status} />
            <span className="cp-run-meta">{run.trigger}</span>
            <span className="cp-run-meta">{formatRelative(run.createdAt)}</span>
            <span className="cp-run-meta">{formatDuration(run.durationMs)}</span>
            <span className="cp-run-expand">{expanded === run.id ? "▲" : "▼"} {run.events.length} events</span>
          </div>
          {expanded === run.id && (
            <div className="cp-run-events">
              {run.errorMessage && (
                <div className="cp-event-row" style={{ color: "var(--color-error)" }}>
                  ✕ {run.errorMessage}
                </div>
              )}
              {run.events.map((ev) => (
                <div key={ev.id} className="cp-event-row">
                  <span
                    className="cp-event-level"
                    style={{ color: EVENT_COLORS[ev.level] ?? "var(--color-text-secondary)" }}
                  >
                    {ev.level.toUpperCase()}
                  </span>
                  {ev.step && <span className="cp-event-step">[{ev.step}]</span>}
                  <span className="cp-event-msg">{ev.message}</span>
                  <span className="cp-event-time">{new Date(ev.createdAt).toLocaleTimeString()}</span>
                </div>
              ))}
              {run.events.length === 0 && (
                <div className="cp-event-row" style={{ color: "var(--color-text-light)" }}>
                  No events logged for this run.
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function WorkflowCard({
  workflow,
  onToggle,
  onTrigger,
}: {
  workflow: Workflow;
  onToggle: (id: string, enabled: boolean) => void;
  onTrigger: (workflowId: string) => void;
}) {
  const [showRuns, setShowRuns] = useState(false);
  const lastRun = workflow.runs[0] ?? null;

  return (
    <div className="cp-workflow-card">
      <div className="cp-workflow-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
          <Toggle
            enabled={workflow.enabled}
            onChange={(v) => onToggle(workflow.id, v)}
          />
          <span className="cp-workflow-name">{workflow.name}</span>
          {workflow.schedule && workflow.schedule !== "manual" && (
            <span className="cp-workflow-schedule">{workflow.schedule}</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {lastRun && <Badge label={lastRun.status} status={lastRun.status} />}
          {lastRun && (
            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
              {formatRelative(lastRun.createdAt)}
            </span>
          )}
          <button
            className="cp-btn-primary"
            onClick={() => onTrigger(workflow.id)}
            disabled={!workflow.enabled}
          >
            ▶ Run
          </button>
          <button className="cp-btn-ghost" onClick={() => setShowRuns(!showRuns)}>
            {showRuns ? "Hide" : "History"}
          </button>
        </div>
      </div>
      {workflow.description && (
        <p className="cp-workflow-desc">{workflow.description}</p>
      )}
      {showRuns && <RunTimeline runs={workflow.runs} />}
    </div>
  );
}

function IntegrationRow({
  integration,
  onToggle,
}: {
  integration: Integration;
  onToggle: (id: string, enabled: boolean) => void;
}) {
  const statusColor = integration.lastStatus
    ? STATUS_COLORS[integration.lastStatus] ?? "var(--color-text-secondary)"
    : "var(--color-text-light)";

  return (
    <div className="cp-integration-row">
      <Toggle
        enabled={integration.enabled}
        onChange={(v) => onToggle(integration.id, v)}
      />
      <div className="cp-integration-info">
        <span className="cp-integration-name">{integration.name}</span>
        <span className="cp-integration-type">{integration.type}</span>
      </div>
      <div className="cp-integration-status">
        {integration.lastStatus ? (
          <Badge label={integration.lastStatus} status={integration.lastStatus} />
        ) : (
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-light)" }}>
            Never synced
          </span>
        )}
        {integration.lastSyncAt && (
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
            {formatRelative(integration.lastSyncAt)}
          </span>
        )}
      </div>
      {integration.lastMessage && (
        <span
          style={{
            fontSize: "var(--font-size-xs)",
            color: statusColor,
            maxWidth: 200,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={integration.lastMessage}
        >
          {integration.lastMessage}
        </span>
      )}
    </div>
  );
}

function ProjectDetail({
  projectId,
  onBack,
}: {
  projectId: string;
  onBack: () => void;
}) {
  const [project, setProject] = useState<Project | null>(null);
  const [tab, setTab] = useState<"integrations" | "workflows">("integrations");
  const [loading, setLoading] = useState(true);
  const [showNewIntegration, setShowNewIntegration] = useState(false);
  const [showNewWorkflow, setShowNewWorkflow] = useState(false);
  const [newIntegration, setNewIntegration] = useState({ name: "", type: "starship" });
  const [newWorkflow, setNewWorkflow] = useState({ name: "", description: "", schedule: "manual" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProject(projectId);
      setProject(data);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const handleToggleIntegration = async (id: string, enabled: boolean) => {
    await updateIntegration(id, { enabled });
    load();
  };

  const handleToggleWorkflow = async (id: string, enabled: boolean) => {
    await updateWorkflow(id, { enabled });
    load();
  };

  const handleTriggerRun = async (workflowId: string) => {
    await triggerRun(workflowId);
    load();
  };

  const handleAddIntegration = async () => {
    if (!newIntegration.name) return;
    setSaving(true);
    try {
      await createIntegration({ projectId, name: newIntegration.name, type: newIntegration.type });
      setNewIntegration({ name: "", type: "starship" });
      setShowNewIntegration(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleAddWorkflow = async () => {
    if (!newWorkflow.name) return;
    setSaving(true);
    try {
      await createWorkflow({ projectId, ...newWorkflow });
      setNewWorkflow({ name: "", description: "", schedule: "manual" });
      setShowNewWorkflow(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="cp-loading">Loading project…</div>;
  if (!project) return <div>Project not found.</div>;

  return (
    <div className="cp-detail">
      <div className="cp-detail-header">
        <button className="cp-btn-ghost" onClick={onBack}>← All Projects</button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            className="cp-project-dot"
            style={{ backgroundColor: project.color }}
          />
          <h2 className="cp-detail-title">{project.name}</h2>
          <Badge label={project.status} status={project.status} />
        </div>
        {project.description && (
          <p className="cp-detail-desc">{project.description}</p>
        )}
      </div>

      <div className="cp-detail-tabs">
        <button
          className={`cp-tab${tab === "integrations" ? " active" : ""}`}
          onClick={() => setTab("integrations")}
        >
          Integrations ({project.integrations.length})
        </button>
        <button
          className={`cp-tab${tab === "workflows" ? " active" : ""}`}
          onClick={() => setTab("workflows")}
        >
          Workflows ({project.workflows.length})
        </button>
      </div>

      {tab === "integrations" && (
        <div className="cp-section">
          <div className="cp-section-actions">
            <button className="cp-btn-primary" onClick={() => setShowNewIntegration(!showNewIntegration)}>
              + Add Integration
            </button>
          </div>
          {showNewIntegration && (
            <div className="cp-form-inline">
              <input
                className="cp-input"
                placeholder="Integration name (e.g. StarShip Poller)"
                value={newIntegration.name}
                onChange={(e) => setNewIntegration((p) => ({ ...p, name: e.target.value }))}
              />
              <select
                className="cp-select"
                value={newIntegration.type}
                onChange={(e) => setNewIntegration((p) => ({ ...p, type: e.target.value }))}
              >
                {INTEGRATION_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <button className="cp-btn-primary" onClick={handleAddIntegration} disabled={saving}>
                {saving ? "Saving…" : "Add"}
              </button>
              <button className="cp-btn-ghost" onClick={() => setShowNewIntegration(false)}>Cancel</button>
            </div>
          )}
          <div className="cp-integration-list">
            {project.integrations.length === 0 ? (
              <p className="cp-empty">No integrations yet. Add one to connect this project to a data source.</p>
            ) : (
              project.integrations.map((i) => (
                <IntegrationRow key={i.id} integration={i} onToggle={handleToggleIntegration} />
              ))
            )}
          </div>
        </div>
      )}

      {tab === "workflows" && (
        <div className="cp-section">
          <div className="cp-section-actions">
            <button className="cp-btn-primary" onClick={() => setShowNewWorkflow(!showNewWorkflow)}>
              + Add Workflow
            </button>
          </div>
          {showNewWorkflow && (
            <div className="cp-form-inline" style={{ flexWrap: "wrap" }}>
              <input
                className="cp-input"
                placeholder="Workflow name"
                value={newWorkflow.name}
                onChange={(e) => setNewWorkflow((p) => ({ ...p, name: e.target.value }))}
              />
              <input
                className="cp-input"
                placeholder="Description (optional)"
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow((p) => ({ ...p, description: e.target.value }))}
              />
              <input
                className="cp-input"
                placeholder="Schedule (cron or 'manual')"
                value={newWorkflow.schedule}
                onChange={(e) => setNewWorkflow((p) => ({ ...p, schedule: e.target.value }))}
                style={{ width: 160 }}
              />
              <button className="cp-btn-primary" onClick={handleAddWorkflow} disabled={saving}>
                {saving ? "Saving…" : "Add"}
              </button>
              <button className="cp-btn-ghost" onClick={() => setShowNewWorkflow(false)}>Cancel</button>
            </div>
          )}
          <div className="cp-workflow-list">
            {project.workflows.length === 0 ? (
              <p className="cp-empty">No workflows yet. Add one to define automation steps for this project.</p>
            ) : (
              project.workflows.map((w) => (
                <WorkflowCard
                  key={w.id}
                  workflow={w}
                  onToggle={handleToggleWorkflow}
                  onTrigger={handleTriggerRun}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, onSelect }: { project: Project; onSelect: (id: string) => void }) {
  const activeIntegrations = project.integrations.filter((i) => i.enabled).length;
  const lastRun = project.workflows.flatMap((w) => w.runs ?? []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0] ?? null;

  return (
    <div
      className="cp-project-card"
      style={{ borderLeft: `4px solid ${project.color}` }}
      onClick={() => onSelect(project.id)}
    >
      <div className="cp-project-card-header">
        <span className="cp-project-name">{project.name}</span>
        <Badge label={project.status} status={project.status} />
      </div>
      {project.description && (
        <p className="cp-project-desc">{project.description}</p>
      )}
      <div className="cp-project-stats">
        <span className="cp-stat">
          <span className="cp-stat-value">{project.integrations.length}</span>
          <span className="cp-stat-label">integrations</span>
        </span>
        <span className="cp-stat">
          <span className="cp-stat-value">{activeIntegrations}</span>
          <span className="cp-stat-label">active</span>
        </span>
        <span className="cp-stat">
          <span className="cp-stat-value">{project.workflows.length}</span>
          <span className="cp-stat-label">workflows</span>
        </span>
        {lastRun && (
          <span className="cp-stat">
            <StatusDot status={lastRun.status} />
            <span className="cp-stat-label">{formatRelative(lastRun.createdAt)}</span>
          </span>
        )}
      </div>
      <div className="cp-project-card-footer">
        <span className="cp-manage-link">Manage →</span>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const ControlPlanePanel: React.FC = () => {
  const [health, setHealth] = useState<HealthResult | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", slug: "", description: "", color: "#0B9BA8" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const PRESET_COLORS = ["#0B9BA8", "#5B7C99", "#1F7F4A", "#DA8D2B", "#C4383D", "#0761D5", "#8B5CF6"];

  const loadHealth = useCallback(async () => {
    try {
      const h = await fetchAdminHealth();
      setHealth(h);
    } catch {
      setHealth({ overall: "error", timestamp: new Date().toISOString(), services: { backend: { status: "error", message: "unreachable" } } });
    }
  }, []);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHealth();
    loadProjects();
  }, [loadHealth, loadProjects]);

  const handleCreateProject = async () => {
    if (!newProject.name || !newProject.slug) return;
    setSaving(true);
    try {
      await createProject(newProject);
      setNewProject({ name: "", slug: "", description: "", color: "#0B9BA8" });
      setShowNewProject(false);
      loadProjects();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  if (selectedProject) {
    return (
      <div className="cp-root">
        <HealthStrip health={health} onRefresh={loadHealth} />
        <ProjectDetail
          projectId={selectedProject}
          onBack={() => { setSelectedProject(null); loadProjects(); }}
        />
      </div>
    );
  }

  return (
    <div className="cp-root">
      <HealthStrip health={health} onRefresh={loadHealth} />

      <div className="cp-projects-header">
        <h2 className="cp-section-title">Projects</h2>
        <button className="cp-btn-primary" onClick={() => setShowNewProject(!showNewProject)}>
          + New Project
        </button>
      </div>

      {showNewProject && (
        <div className="cp-new-project-form">
          <h3 className="cp-form-title">Create Project</h3>
          <div className="cp-form-row">
            <label className="cp-label">Name</label>
            <input
              className="cp-input"
              placeholder="e.g. Shipping Intelligence"
              value={newProject.name}
              onChange={(e) => {
                const name = e.target.value;
                setNewProject((p) => ({ ...p, name, slug: autoSlug(name) }));
              }}
            />
          </div>
          <div className="cp-form-row">
            <label className="cp-label">Slug</label>
            <input
              className="cp-input cp-input-mono"
              placeholder="shipping-intelligence"
              value={newProject.slug}
              onChange={(e) => setNewProject((p) => ({ ...p, slug: e.target.value }))}
            />
          </div>
          <div className="cp-form-row">
            <label className="cp-label">Description</label>
            <input
              className="cp-input"
              placeholder="What does this project do?"
              value={newProject.description}
              onChange={(e) => setNewProject((p) => ({ ...p, description: e.target.value }))}
            />
          </div>
          <div className="cp-form-row">
            <label className="cp-label">Color</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewProject((p) => ({ ...p, color: c }))}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    backgroundColor: c,
                    border: newProject.color === c ? "2px solid var(--color-text-primary)" : "2px solid transparent",
                    cursor: "pointer",
                  }}
                />
              ))}
              <input
                type="color"
                value={newProject.color}
                onChange={(e) => setNewProject((p) => ({ ...p, color: e.target.value }))}
                style={{ width: 32, height: 28, cursor: "pointer", border: "none", borderRadius: 4 }}
              />
            </div>
          </div>
          <div className="cp-form-actions">
            <button className="cp-btn-primary" onClick={handleCreateProject} disabled={saving || !newProject.name || !newProject.slug}>
              {saving ? "Creating…" : "Create Project"}
            </button>
            <button className="cp-btn-ghost" onClick={() => setShowNewProject(false)}>Cancel</button>
          </div>
        </div>
      )}

      {error && (
        <div className="cp-error-banner">
          ⚠ {error}
          <button className="cp-btn-ghost" onClick={loadProjects} style={{ marginLeft: 8 }}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="cp-loading">Loading projects…</div>
      ) : projects.length === 0 ? (
        <div className="cp-empty-state">
          <p>No projects yet.</p>
          <p>Create your first project to start tracking integrations, workflows, and run history.</p>
          <button className="cp-btn-primary" onClick={() => setShowNewProject(true)}>
            + Create your first project
          </button>
        </div>
      ) : (
        <div className="cp-projects-grid">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} onSelect={setSelectedProject} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ControlPlanePanel;
