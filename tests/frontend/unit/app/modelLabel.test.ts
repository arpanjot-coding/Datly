import { describe, expect, it } from 'vitest';

import { formatModelLabel } from '../../../../src/app/modelLabel';

describe('formatModelLabel', () => {
    it('strips a trailing YYYYMMDD snapshot and title-cases the rest', () => {
        expect(formatModelLabel('claude-sonnet-4-20250514')).toBe('Claude Sonnet 4');
    });

    it('joins a GPT family id with a hyphen', () => {
        expect(formatModelLabel('gpt-4o')).toBe('GPT-4o');
        expect(formatModelLabel('gpt-4.1-mini')).toBe('GPT-4.1 Mini');
    });

    it('collapses version pairs like 3-5 into 3.5', () => {
        expect(formatModelLabel('claude-3-5-sonnet-20241022')).toBe('Claude 3.5 Sonnet');
    });

    it('leaves empty input alone', () => {
        expect(formatModelLabel('')).toBe('');
        expect(formatModelLabel('   ')).toBe('');
    });

    it('keeps reasoning-model ids readable', () => {
        expect(formatModelLabel('o3-mini')).toBe('o3 Mini');
    });
});
