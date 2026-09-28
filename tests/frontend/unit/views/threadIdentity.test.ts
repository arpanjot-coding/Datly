import { describe, expect, it } from 'vitest';

import {
    activeThreadKey,
    buildThreadIdentities,
    tableDisplayName,
    threadSectionId,
} from '../../../../src/views/threadIdentity';

describe('tableDisplayName', () => {
    it('prefers an inferred name, then displayId, then id', () => {
        expect(tableDisplayName({ id: 't1', displayId: 'sales' }, 'Monthly sales')).toBe('Monthly sales');
        expect(tableDisplayName({ id: 't1', displayId: 'sales' })).toBe('sales');
        expect(tableDisplayName({ id: 't1' })).toBe('t1');
        expect(tableDisplayName(undefined)).toBe('');
    });

    it('ignores blank inferred names', () => {
        expect(tableDisplayName({ id: 't1', displayId: 'sales' }, '   ')).toBe('sales');
    });
});

describe('threadSectionId', () => {
    it('builds a stable HTML id from the entry key', () => {
        expect(threadSectionId('thread-abc.def')).toBe('data-thread-section-thread-abc-def');
    });
});

describe('buildThreadIdentities', () => {
    const nameOf = (id: string) => ({ src: 'customers.csv', leaf: 'monthly_sales' }[id]);

    it('skips the source shelf and continuation segments', () => {
        const identities = buildThreadIdentities([
            { key: 'source-shelf', isShelf: true },
            { key: 'thread-a', threadIndex: 1, isRootless: true },
            { key: 'thread-a-cont', isSplitThread: true, leafTable: { id: 'leaf' } },
        ], nameOf);
        expect(identities).toEqual([
            { key: 'thread-a', index: 1, kind: 'question' },
        ]);
    });

    it('labels a question-rooted thread, a source-artifact thread, and a derived leaf', () => {
        const identities = buildThreadIdentities([
            { key: 'rootless-thread', threadIndex: 1, isRootless: true },
            { key: 'source-thread-src', threadIndex: 2, originTableId: 'src' },
            { key: 'thread-leaf', threadIndex: 3, originTableId: 'src', leafTable: { id: 'leaf', displayId: 'monthly_sales' } },
        ], nameOf);
        expect(identities).toEqual([
            { key: 'rootless-thread', index: 1, kind: 'question' },
            { key: 'source-thread-src', index: 2, kind: 'source', tableName: 'customers.csv' },
            { key: 'thread-leaf', index: 3, kind: 'derived', tableName: 'monthly_sales' },
        ]);
    });

    it('falls back to the table id when no display name is known', () => {
        const identities = buildThreadIdentities([
            { key: 'source-thread-x', threadIndex: 1, originTableId: 'unknown' },
        ], () => undefined);
        expect(identities[0].tableName).toBe('unknown');
    });
});

describe('activeThreadKey', () => {
    const entries = [
        { key: 'source-shelf', isShelf: true },
        { key: 'rootless-thread', isRootless: true },
        { key: 'source-thread-src', originTableId: 'src' },
        { key: 'thread-leaf', leafTable: { id: 'leaf' }, originTableId: 'src' },
        { key: 'thread-leaf-cont', isSplitThread: true, leafTable: { id: 'leaf-b' } },
    ];

    it('returns undefined when nothing is focused', () => {
        expect(activeThreadKey(entries, undefined)).toBeUndefined();
    });

    it('matches a derived leaf, a source-artifact thread, and the question thread', () => {
        expect(activeThreadKey(entries, 'leaf')).toBe('thread-leaf');
        expect(activeThreadKey(entries, 'src')).toBe('source-thread-src');
        expect(activeThreadKey(entries, '__rootless_thread__')).toBe('rootless-thread');
    });

    it('does not treat a continuation segment as the active thread', () => {
        expect(activeThreadKey(entries, 'leaf-b')).toBeUndefined();
    });
});
