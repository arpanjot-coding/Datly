/**
 * Demo cards must be reachable and activatable from the keyboard.
 *
 * They were plain click-handling divs, so they never appeared in the
 * accessibility tree and could not be opened without a mouse.
 */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { ExampleSessionCard } from '../../../../src/views/ExampleSessions';

const session = {
    id: 'stock-prices',
    title: 'Stock Prices',
    description: 'Stock prices for different companies',
    previewImage: '/demos/stock-thumbnail.webp',
    workspace: '/demos/demo_stock.zip',
    live: false,
};

describe('ExampleSessionCard', () => {
    it('is exposed as a button in the accessibility tree', () => {
        render(<ExampleSessionCard session={session} onClick={vi.fn()} />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('is keyboard focusable', () => {
        render(<ExampleSessionCard session={session} onClick={vi.fn()} />);
        const card = screen.getByRole('button');
        expect(card).toHaveAttribute('tabindex', '0');
        card.focus();
        expect(card).toHaveFocus();
    });

    it('activates on Enter', () => {
        const onClick = vi.fn();
        render(<ExampleSessionCard session={session} onClick={onClick} />);
        fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
        expect(onClick).toHaveBeenCalledOnce();
    });

    it('activates on Space', () => {
        const onClick = vi.fn();
        render(<ExampleSessionCard session={session} onClick={onClick} />);
        fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });
        expect(onClick).toHaveBeenCalledOnce();
    });

    it('ignores other keys', () => {
        const onClick = vi.fn();
        render(<ExampleSessionCard session={session} onClick={onClick} />);
        fireEvent.keyDown(screen.getByRole('button'), { key: 'a' });
        expect(onClick).not.toHaveBeenCalled();
    });

    it('does not activate or take focus when disabled', () => {
        const onClick = vi.fn();
        render(<ExampleSessionCard session={session} onClick={onClick} disabled />);
        const card = screen.getByRole('button');
        expect(card).toHaveAttribute('aria-disabled', 'true');
        expect(card).toHaveAttribute('tabindex', '-1');
        fireEvent.keyDown(card, { key: 'Enter' });
        fireEvent.click(card);
        expect(onClick).not.toHaveBeenCalled();
    });
});
