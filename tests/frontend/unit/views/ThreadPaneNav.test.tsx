/**
 * The analysis-thread jump bar must be a keyboard-reachable tablist so
 * users can move between Thread 1 / Thread 2 without hunting in columns.
 */
import '@testing-library/jest-dom/vitest';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import { ThreadPaneNav } from '../../../../src/views/ThreadPaneNav';
import type { ThreadIdentity } from '../../../../src/views/threadIdentity';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, opts?: { index?: number; count?: number; name?: string; label?: string; defaultValue?: string }) => {
            if (key === 'dataThread.paneTitle') return 'Analysis';
            if (key === 'dataThread.paneNav') return 'Jump to an analysis thread';
            if (key === 'dataThread.threadTitle') return `Thread ${opts?.index}`;
            if (key === 'dataThread.threadCount') {
                return (opts?.count ?? 0) === 1 ? '1 thread' : `${opts?.count} threads`;
            }
            if (key === 'dataThread.fromQuestion') return 'Started from your question';
            if (key === 'dataThread.fromSource') return `On ${opts?.name}`;
            if (key === 'dataThread.resultTable') return opts?.name ?? '';
            if (key === 'dataThread.jumpToThread') return `Jump to thread ${opts?.index}, ${opts?.label}`;
            return opts?.defaultValue ?? key;
        },
    }),
}));

const theme = createTheme();

const items: ThreadIdentity[] = [
    { key: 'rootless-thread', index: 1, kind: 'question' },
    { key: 'thread-leaf', index: 2, kind: 'derived', tableName: 'monthly_sales' },
];

const renderNav = (props?: Partial<ComponentProps<typeof ThreadPaneNav>>) =>
    render(
        <ThemeProvider theme={theme}>
            <ThreadPaneNav items={items} onSelect={vi.fn()} {...props} />
        </ThemeProvider>,
    );

describe('ThreadPaneNav', () => {
    it('exposes a navigation landmark and a tablist', () => {
        renderNav();
        expect(screen.getByRole('navigation', { name: 'Jump to an analysis thread' })).toBeInTheDocument();
        expect(screen.getByRole('tablist', { name: 'Jump to an analysis thread' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Analysis' })).toBeInTheDocument();
        expect(screen.getByText('2 threads')).toBeInTheDocument();
    });

    it('renders one tab per thread with a readable name', () => {
        renderNav({ activeKey: 'thread-leaf' });
        const tabs = screen.getAllByRole('tab');
        expect(tabs).toHaveLength(2);
        expect(tabs[0]).toHaveAccessibleName('Jump to thread 1, Started from your question');
        expect(tabs[1]).toHaveAccessibleName('Jump to thread 2, monthly_sales');
        expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
        expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
    });

    it('uses roving tabindex so only the current tab is in the tab order', () => {
        renderNav({ activeKey: 'thread-leaf' });
        const tabs = screen.getAllByRole('tab');
        expect(tabs[0]).toHaveAttribute('tabindex', '-1');
        expect(tabs[1]).toHaveAttribute('tabindex', '0');
    });

    it('activates a tab on click', () => {
        const onSelect = vi.fn();
        renderNav({ onSelect });
        fireEvent.click(screen.getAllByRole('tab')[1]);
        expect(onSelect).toHaveBeenCalledWith('thread-leaf');
    });

    it('moves between tabs with arrow keys, Home, and End', () => {
        const onSelect = vi.fn();
        renderNav({ activeKey: 'rootless-thread', onSelect });
        const first = screen.getAllByRole('tab')[0];
        first.focus();
        fireEvent.keyDown(first, { key: 'ArrowRight' });
        expect(onSelect).toHaveBeenCalledWith('thread-leaf');
        fireEvent.keyDown(first, { key: 'End' });
        expect(onSelect).toHaveBeenLastCalledWith('thread-leaf');
        fireEvent.keyDown(first, { key: 'Home' });
        expect(onSelect).toHaveBeenLastCalledWith('rootless-thread');
        fireEvent.keyDown(first, { key: 'ArrowLeft' });
        expect(onSelect).toHaveBeenLastCalledWith('thread-leaf');
    });

    it('renders nothing when there are no threads to jump to', () => {
        const { container } = renderNav({ items: [] });
        expect(container).toBeEmptyDOMElement();
    });
});
