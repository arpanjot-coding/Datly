import { apiRequest } from './apiClient';
import { getUrls } from './utils';
import type { CleanVerb } from './cleanVerbs';

export type PipelineTrigger = 'manual' | 'schedule' | 'refresh' | 'load';
export type PipelineRunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type PipelineStepType = 'load' | 'profile' | 'clean' | 'derive' | 'visualize' | 'report' | 'workflow' | 'refresh';

export interface PipelineStep {
    id: string;
    step_type: PipelineStepType;
    status: string;
    params: Record<string, unknown>;
    result?: Record<string, unknown>;
    error?: string | null;
}

export interface PipelineRun {
    id: string;
    workspace_id: string;
    trigger: PipelineTrigger;
    status: PipelineRunStatus;
    steps: PipelineStep[];
    context: Record<string, unknown>;
    error?: string | null;
    created_at: string;
    started_at?: string | null;
    finished_at?: string | null;
}

export interface ProfileIssue {
    code: string;
    severity: 'info' | 'warning' | 'critical';
    message: string;
    column?: string;
}

export interface TableProfile {
    table_name: string;
    profiled_at: string;
    row_count: number;
    schema_hash: string;
    quality_score: number;
    status: 'healthy' | 'warning' | 'critical';
    columns: Array<{
        column: string;
        type?: string;
        null_pct: number;
        duplicate_pct: number;
        issues: ProfileIssue[];
    }>;
    issues: ProfileIssue[];
    suggestions?: CleanSuggestion[];
    drift?: Record<string, unknown> | null;
}

export interface CleanSuggestion {
    verb: CleanVerb;
    column?: string | null;
    reason: string;
    auto_safe: boolean;
    params: Record<string, unknown>;
}

export interface DashboardTile {
    id: string;
    chart_id: string;
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface Dashboard {
    id: string;
    name: string;
    tiles: DashboardTile[];
    filters: Record<string, unknown>;
    updated_at: string;
}

export interface PipelineSchedule {
    id: string;
    name: string;
    cron: string;
    workspace_id: string;
    table_name?: string | null;
    workflow_path?: string | null;
    enabled: boolean;
    created_at: string;
}

export async function runPipeline(body: {
    workspace_id?: string;
    trigger?: PipelineTrigger;
    table_name?: string;
    steps?: Array<{ step_type: PipelineStepType; params?: Record<string, unknown> }>;
    context?: Record<string, unknown>;
}): Promise<PipelineRun> {
    const { data } = await apiRequest<{ run: PipelineRun }>(getUrls().PIPELINE_RUN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return data.run;
}

export async function listPipelineRuns(limit = 20): Promise<PipelineRun[]> {
    const { data } = await apiRequest<{ runs: PipelineRun[] }>(`${getUrls().PIPELINE_RUNS}?limit=${limit}`);
    return data.runs;
}

export async function profileTable(tableName: string): Promise<TableProfile> {
    const { data } = await apiRequest<{ profile: TableProfile }>(getUrls().PIPELINE_PROFILE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table_name: tableName }),
    });
    return data.profile;
}

export async function getTableProfile(tableName: string): Promise<TableProfile | null> {
    try {
        const { data } = await apiRequest<{ profile: TableProfile }>(
            `${getUrls().PIPELINE_PROFILE_GET}/${encodeURIComponent(tableName)}`,
        );
        return data.profile;
    } catch {
        return null;
    }
}

export async function fetchCleanSuggestions(tableName: string): Promise<CleanSuggestion[]> {
    const { data } = await apiRequest<{ suggestions: CleanSuggestion[] }>(getUrls().PIPELINE_SUGGESTIONS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table_name: tableName }),
    });
    return data.suggestions;
}

export async function triggerRefreshCascade(body: {
    table_name: string;
    data_changed: boolean;
    workspace_id?: string;
}): Promise<PipelineRun> {
    const { data } = await apiRequest<{ run: PipelineRun }>(getUrls().PIPELINE_TRIGGER_REFRESH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return data.run;
}

export async function listDashboards(): Promise<Dashboard[]> {
    const { data } = await apiRequest<{ dashboards: Dashboard[] }>(getUrls().DASHBOARD_LIST);
    return data.dashboards;
}

export async function saveDashboard(dashboard: Partial<Dashboard> & { name: string }): Promise<Dashboard> {
    const { data } = await apiRequest<{ dashboard: Dashboard }>(getUrls().DASHBOARD_SAVE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dashboard),
    });
    return data.dashboard;
}

export async function listSchedules(): Promise<PipelineSchedule[]> {
    const { data } = await apiRequest<{ schedules: PipelineSchedule[] }>(getUrls().DASHBOARD_SCHEDULES);
    return data.schedules;
}

export async function setTableBindings(tableName: string, workflowIds: string[]): Promise<void> {
    await apiRequest(getUrls().PIPELINE_TABLE_BINDINGS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table_name: tableName, workflow_ids: workflowIds }),
    });
}

export async function saveSchedule(schedule: Partial<PipelineSchedule> & { name: string; cron: string }): Promise<PipelineSchedule> {
    const { data } = await apiRequest<{ schedule: PipelineSchedule }>(getUrls().DASHBOARD_SCHEDULES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule),
    });
    return data.schedule;
}
