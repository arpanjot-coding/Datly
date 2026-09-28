import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { createTableFromText } from '../data/utils';
import { DictTable } from '../components/ComponentType';
import { DataFormulatorState, dfActions, dfSelectors } from '../app/dfSlice';
import { generateUUID } from '../app/identity';

export interface GridRange {
    r0: number;
    c0: number;
    r1: number;
    c1: number;
}

export interface GridClipboardHost {
    getTsv: () => string | null;
    paste: (plain: string, html: string) => void;
    selectAll?: () => void;
}

export function normalizeRange(range: GridRange): { r0: number; c0: number; r1: number; c1: number } {
    return {
        r0: Math.min(range.r0, range.r1),
        c0: Math.min(range.c0, range.c1),
        r1: Math.max(range.r0, range.r1),
        c1: Math.max(range.c0, range.c1),
    };
}

export function tsvEscape(value: unknown): string {
    if (value == null) return '';
    const s = typeof value === 'object' ? String(value) : String(value);
    if (/[\t\n\r"]/.test(s)) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}

export function selectionToTsv(
    rows: Array<Record<string, unknown>>,
    columnIds: string[],
    range: GridRange,
): string {
    if (!rows.length || !columnIds.length) return '';
    const n = normalizeRange(range);
    const rowStart = Math.max(0, Math.min(n.r0, rows.length - 1));
    const rowEnd = Math.max(0, Math.min(n.r1, rows.length - 1));
    const colStart = Math.max(0, Math.min(n.c0, columnIds.length - 1));
    const colEnd = Math.max(0, Math.min(n.c1, columnIds.length - 1));
    const lines: string[] = [];
    for (let r = rowStart; r <= rowEnd; r++) {
        const cells: string[] = [];
        for (let c = colStart; c <= colEnd; c++) {
            cells.push(tsvEscape(rows[r]?.[columnIds[c]]));
        }
        lines.push(cells.join('\t'));
    }
    return lines.join('\n');
}

function decodeHtmlEntities(text: string): string {
    return text
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#10;/g, '\n')
        .replace(/&#13;/g, '');
}

function cellHtmlToText(html: string): string {
    return decodeHtmlEntities(
        html
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]+>/g, ''),
    ).replace(/\u00a0/g, ' ').trim();
}

export function htmlTableToTsv(html: string): string | undefined {
    const tableMatch = html.match(/<table\b[^>]*>[\s\S]*?<\/table>/i);
    if (!tableMatch) return undefined;
    const tableHtml = tableMatch[0];

    if (typeof DOMParser !== 'undefined') {
        try {
            const doc = new DOMParser().parseFromString(tableHtml, 'text/html');
            const table = doc.querySelector('table');
            if (table) {
                const rows = Array.from(table.querySelectorAll('tr'));
                const lines = rows.map((tr) => {
                    const cells = Array.from(tr.querySelectorAll('th,td'));
                    return cells.map((cell) => tsvEscape(cell.textContent ?? '')).join('\t');
                }).filter((line, _, all) => line.length > 0 || all.length === 1);
                if (lines.length) return lines.join('\n');
            }
        } catch {
            // fall through to regex
        }
    }

    const lines: string[] = [];
    const rowRe = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch: RegExpExecArray | null;
    while ((rowMatch = rowRe.exec(tableHtml))) {
        const cells: string[] = [];
        const cellRe = /<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi;
        let cellMatch: RegExpExecArray | null;
        while ((cellMatch = cellRe.exec(rowMatch[1]))) {
            cells.push(tsvEscape(cellHtmlToText(cellMatch[1])));
        }
        if (cells.length) lines.push(cells.join('\t'));
    }
    return lines.length ? lines.join('\n') : undefined;
}

export function parseClipboardText(plainText?: string | null, html?: string | null): string | undefined {
    const plain = (plainText ?? '').replace(/^\uFEFF/, '');
    if (plain.trim()) {
        const trimmed = plain.trim();
        const looksLikeHtmlTable = /<table\b/i.test(trimmed) && /<\/table>/i.test(trimmed);
        if (!looksLikeHtmlTable) {
            return plain.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        }
        return htmlTableToTsv(trimmed) ?? plain.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }
    if (html && html.trim()) {
        return htmlTableToTsv(html);
    }
    return undefined;
}

export function uniqueTableName(base: string, existing: Iterable<string>): string {
    const set = existing instanceof Set ? existing : new Set(existing);
    let name = base;
    let n = 1;
    while (set.has(name)) {
        name = `${base}_${n}`;
        n += 1;
    }
    return name;
}

export function tableFromClipboard(
    plain: string,
    html: string,
    existingNames: Iterable<string>,
): { table: DictTable } | { error: 'empty' | 'parse' } {
    const text = parseClipboardText(plain, html);
    if (!text || !text.trim()) return { error: 'empty' };
    const name = uniqueTableName('paste', existingNames);
    const table = createTableFromText(name, text);
    if (!table) return { error: 'parse' };
    return { table };
}

export function isEditableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) return false;
    return !!target.closest('input, textarea, select, [contenteditable="true"], .cm-editor, .cm-content, [role="textbox"]');
}

const hosts: GridClipboardHost[] = [];
let installCount = 0;

export function pushGridClipboardHost(host: GridClipboardHost): () => void {
    hosts.push(host);
    return () => {
        const i = hosts.lastIndexOf(host);
        if (i >= 0) hosts.splice(i, 1);
    };
}

export function bringHostToTop(host: GridClipboardHost): void {
    const i = hosts.lastIndexOf(host);
    if (i >= 0) hosts.splice(i, 1);
    hosts.push(host);
}

function currentHost(): GridClipboardHost | undefined {
    return hosts[hosts.length - 1];
}

function onCopy(e: ClipboardEvent): void {
    if (isEditableTarget(e.target)) return;
    const tsv = currentHost()?.getTsv();
    if (!tsv) return;
    e.preventDefault();
    e.clipboardData?.setData('text/plain', tsv);
}

function onPaste(e: ClipboardEvent): void {
    if (isEditableTarget(e.target)) return;
    const host = currentHost();
    if (!host) return;
    e.preventDefault();
    const plain = e.clipboardData?.getData('text/plain') || '';
    const html = e.clipboardData?.getData('text/html') || '';
    host.paste(plain, html);
}

function onKeyDown(e: KeyboardEvent): void {
    if (isEditableTarget(e.target)) return;
    if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
    const host = currentHost();
    if (!host) return;
    const key = e.key.toLowerCase();
    if (key === 'a') {
        if (!host.selectAll) return;
        e.preventDefault();
        host.selectAll();
        return;
    }
    if (key === 'c') {
        const tsv = host.getTsv();
        if (!tsv) return;
        e.preventDefault();
        if (navigator.clipboard?.writeText) {
            void navigator.clipboard.writeText(tsv);
        }
    }
}

export function installGridClipboardListeners(): () => void {
    installCount += 1;
    if (installCount === 1) {
        document.addEventListener('copy', onCopy);
        document.addEventListener('paste', onPaste);
        document.addEventListener('keydown', onKeyDown, true);
    }
    return () => {
        installCount -= 1;
        if (installCount <= 0) {
            installCount = 0;
            document.removeEventListener('copy', onCopy);
            document.removeEventListener('paste', onPaste);
            document.removeEventListener('keydown', onKeyDown, true);
        }
    };
}

/** Lowest-priority host so empty canvas paste works when no grid is mounted. Grid hosts stay on top. */
export function installFallbackClipboardHost(host: GridClipboardHost): () => void {
    hosts.unshift(host);
    const uninstall = installGridClipboardListeners();
    return () => {
        const i = hosts.indexOf(host);
        if (i >= 0) hosts.splice(i, 1);
        uninstall();
    };
}

function untitledSessionId(): string {
    return `session_${generateUUID().slice(0, 8)}`;
}

/** Workspace-level paste: TSV then HTML as a new input table. Does not overwrite a focused table. */
export function useWorkspaceTablePasteHost(): void {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const existingTableIds = useSelector((state: DataFormulatorState) =>
        dfSelectors.getAllTables(state).map(tbl => tbl.id),
    );
    const activeWorkspace = useSelector((state: DataFormulatorState) => state.activeWorkspace);
    const viewMode = useSelector((state: DataFormulatorState) => state.viewMode);
    const idsRef = useRef(existingTableIds);
    idsRef.current = existingTableIds;
    const wsRef = useRef(activeWorkspace);
    wsRef.current = activeWorkspace;
    const viewModeRef = useRef(viewMode);
    viewModeRef.current = viewMode;
    const tRef = useRef(t);
    tRef.current = t;

    useEffect(() => {
        const host: GridClipboardHost = {
            getTsv: () => null,
            paste: (plain, html) => {
                if (wsRef.current?.readOnly) return;
                if (viewModeRef.current === 'report') return;
                const result = tableFromClipboard(plain, html, idsRef.current);
                const tr = tRef.current;
                if ('error' in result) {
                    dispatch(dfActions.addMessages({
                        timestamp: Date.now(),
                        component: 'data grid',
                        type: 'warning',
                        value: result.error === 'empty'
                            ? tr('dataGrid.clipboardPasteEmpty')
                            : tr('dataGrid.clipboardPasteFailed'),
                    }));
                    return;
                }
                if (!wsRef.current) {
                    dispatch(dfActions.setActiveWorkspace({
                        id: untitledSessionId(),
                        displayName: 'Untitled Session',
                    }));
                }
                dispatch(dfActions.addTableToStore(result.table));
                dispatch(dfActions.addMessages({
                    timestamp: Date.now(),
                    component: 'data grid',
                    type: 'success',
                    value: tr('dataGrid.clipboardPasted', { name: result.table.id }),
                }));
            },
        };
        return installFallbackClipboardHost(host);
    }, [dispatch]);
}
