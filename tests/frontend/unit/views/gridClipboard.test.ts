import { describe, it, expect, vi } from 'vitest';
import {
    selectionToTsv,
    parseClipboardText,
    htmlTableToTsv,
    installFallbackClipboardHost,
    pushGridClipboardHost,
    installGridClipboardListeners,
} from '../../../../src/views/gridClipboard';

describe('gridClipboard', () => {
    const rows = [
        { a: 1, b: 'x', c: 'y' },
        { a: 2, b: 'p', c: 'q' },
        { a: 3, b: 'hello\tworld', c: 'z' },
    ];
    const cols = ['a', 'b', 'c'];

    it('serializes a cell range as TSV', () => {
        expect(selectionToTsv(rows, cols, { r0: 0, c0: 0, r1: 1, c1: 1 })).toBe('1\tx\n2\tp');
    });

    it('normalizes an inverted range and quotes tabs', () => {
        expect(selectionToTsv(rows, cols, { r0: 2, c0: 2, r1: 2, c1: 1 })).toBe('"hello\tworld"\tz');
    });

    it('bounds the range to loaded rows and columns', () => {
        expect(selectionToTsv(rows, cols, { r0: 0, c0: 0, r1: 99, c1: 0 })).toBe('1\n2\n3');
    });

    it('parses TSV first even when HTML is also present', () => {
        const html = '<table><tr><td>H</td></tr></table>';
        expect(parseClipboardText('A\tB\n1\t2', html)).toBe('A\tB\n1\t2');
    });

    it('parses a TSV blob with no HTML', () => {
        expect(parseClipboardText('name\tage\nAda\t36')).toBe('name\tage\nAda\t36');
    });

    it('falls back to an HTML table when plain text is empty', () => {
        const html = '<table><tr><th>Name</th><th>Age</th></tr><tr><td>Ada</td><td>36</td></tr></table>';
        expect(parseClipboardText('', html)).toBe('Name\tAge\nAda\t36');
        expect(parseClipboardText(undefined, html)).toBe('Name\tAge\nAda\t36');
        expect(htmlTableToTsv(html)).toBe('Name\tAge\nAda\t36');
    });

    it('parses Excel-style HTML fragments', () => {
        const html = `<html><body><!--StartFragment--><table><tr><td>q</td><td>r</td></tr><tr><td>1</td><td>2</td></tr></table><!--EndFragment--></body></html>`;
        expect(parseClipboardText('   ', html)).toBe('q\tr\n1\t2');
    });

    function dispatchPaste(plain: string, html = '') {
        const event = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent;
        Object.defineProperty(event, 'clipboardData', {
            value: { getData: (type: string) => type === 'text/html' ? html : plain },
        });
        document.dispatchEvent(event);
        return event;
    }

    it('fallback host pastes when no grid is mounted', () => {
        const fallback = vi.fn();
        const un = installFallbackClipboardHost({ getTsv: () => null, paste: fallback });
        dispatchPaste('A\tB\n1\t2');
        expect(fallback).toHaveBeenCalledWith('A\tB\n1\t2', '');
        un();
    });

    it('grid host wins paste while mounted; fallback resumes after unmount', () => {
        const fallback = vi.fn();
        const grid = vi.fn();
        const unFallback = installFallbackClipboardHost({ getTsv: () => null, paste: fallback });
        const unGrid = pushGridClipboardHost({ getTsv: () => 'sel', paste: grid });
        const unListen = installGridClipboardListeners();
        dispatchPaste('A\tB\n1\t2');
        expect(grid).toHaveBeenCalledTimes(1);
        expect(fallback).not.toHaveBeenCalled();
        unGrid();
        unListen();
        dispatchPaste('C\tD\n3\t4');
        expect(fallback).toHaveBeenCalledWith('C\tD\n3\t4', '');
        expect(grid).toHaveBeenCalledTimes(1);
        unFallback();
    });
});
