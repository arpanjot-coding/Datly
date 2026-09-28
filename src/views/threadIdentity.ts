/** Labels and section ids for analysis threads in the side pane.
 *
 *  Numbered threads are the navigable units: a question-first run, a
 *  source table that owns artifacts, or a derived-table chain. The source
 *  shelf and continuation segments are layout, not threads.
 */

export type ThreadKind = 'question' | 'source' | 'derived';

export type ThreadIdentityInput = {
    key: string;
    isShelf?: boolean;
    isSplitThread?: boolean;
    isRootless?: boolean;
    originTableId?: string;
    leafTable?: { id: string; displayId?: string };
    threadIndex?: number;
};

export type ThreadIdentity = {
    key: string;
    index: number;
    kind: ThreadKind;
    tableName?: string;
};

export function tableDisplayName(
    table?: { id: string; displayId?: string } | null,
    inferred?: string,
): string {
    const inferredName = inferred?.trim();
    if (inferredName) return inferredName;
    return table?.displayId || table?.id || '';
}

export function threadSectionId(key: string): string {
    return `data-thread-section-${key.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}

export function buildThreadIdentities(
    entries: ThreadIdentityInput[],
    nameOf: (tableId: string) => string | undefined,
): ThreadIdentity[] {
    const out: ThreadIdentity[] = [];
    for (const entry of entries) {
        if (entry.isShelf || entry.isSplitThread || entry.threadIndex == null) continue;
        if (entry.isRootless) {
            out.push({ key: entry.key, index: entry.threadIndex, kind: 'question' });
            continue;
        }
        if (entry.leafTable) {
            out.push({
                key: entry.key,
                index: entry.threadIndex,
                kind: 'derived',
                tableName: tableDisplayName(entry.leafTable, nameOf(entry.leafTable.id)),
            });
            continue;
        }
        if (entry.originTableId) {
            out.push({
                key: entry.key,
                index: entry.threadIndex,
                kind: 'source',
                tableName: nameOf(entry.originTableId) || entry.originTableId,
            });
        }
    }
    return out;
}

export function activeThreadKey(
    entries: Array<{
        key: string;
        isShelf?: boolean;
        isSplitThread?: boolean;
        isRootless?: boolean;
        originTableId?: string;
        leafTable?: { id: string };
    }>,
    focusedThreadLeafId?: string,
    rootlessId = '__rootless_thread__',
): string | undefined {
    if (!focusedThreadLeafId) return undefined;
    return entries.find((entry) => {
        if (entry.isShelf || entry.isSplitThread) return false;
        if (entry.isRootless) return focusedThreadLeafId === rootlessId;
        if (entry.leafTable?.id === focusedThreadLeafId) return true;
        if (!entry.leafTable && entry.originTableId === focusedThreadLeafId) return true;
        return false;
    })?.key;
}
