import React, { useCallback } from 'react';
import { Box } from '@mui/material';

import { radius, shadow, surface, transition } from '../app/tokens';

export interface SegmentedPillOption<T extends string = string> {
    value: T;
    label: React.ReactNode;
    disabled?: boolean;
}

export interface SegmentedPillsProps<T extends string = string> {
    options: SegmentedPillOption<T>[];
    value: T;
    onChange: (value: T) => void;
    ariaLabel?: string;
}

const TRACK_PAD = 3;

/**
 * Sliding-thumb segmented control (Explore / Reports). Box + thumb, not MUI Tabs.
 */
export function SegmentedPills<T extends string>({
    options,
    value,
    onChange,
    ariaLabel,
}: SegmentedPillsProps<T>) {
    const count = options.length;
    const selectedIndex = Math.max(0, options.findIndex((opt) => opt.value === value));

    const focusOption = (index: number) => {
        const el = document.getElementById(`segmented-pill-${options[index].value}`);
        el?.focus();
    };

    const moveTo = useCallback((index: number) => {
        const opt = options[index];
        if (!opt || opt.disabled) return;
        if (opt.value !== value) onChange(opt.value);
        focusOption(index);
    }, [onChange, options, value]);

    const onKeyDown = (event: React.KeyboardEvent) => {
        if (count === 0) return;
        let next = selectedIndex;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            next = (selectedIndex + 1) % count;
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            next = (selectedIndex - 1 + count) % count;
        } else if (event.key === 'Home') {
            next = 0;
        } else if (event.key === 'End') {
            next = count - 1;
        } else {
            return;
        }
        event.preventDefault();
        let guard = 0;
        while (options[next]?.disabled && guard < count) {
            next = event.key === 'ArrowLeft' || event.key === 'ArrowUp' || event.key === 'Home'
                ? (next - 1 + count) % count
                : (next + 1) % count;
            guard += 1;
        }
        moveTo(next);
    };

    return (
        <Box
            className="df-no-drag"
            role="radiogroup"
            aria-label={ariaLabel}
            onKeyDown={onKeyDown}
            sx={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: count > 0 ? `repeat(${count}, 1fr)` : undefined,
                alignItems: 'stretch',
                p: `${TRACK_PAD}px`,
                backgroundColor: surface.overlay,
                borderRadius: radius.pill,
            }}
        >
            {count > 0 && (
                <Box
                    aria-hidden
                    sx={{
                        position: 'absolute',
                        top: TRACK_PAD,
                        bottom: TRACK_PAD,
                        left: TRACK_PAD,
                        width: `calc((100% - ${TRACK_PAD * 2}px) / ${count})`,
                        borderRadius: radius.pill,
                        backgroundColor: surface.card,
                        boxShadow: shadow.sm,
                        transform: `translateX(${selectedIndex * 100}%)`,
                        transition: transition.normal,
                        pointerEvents: 'none',
                        '@media (prefers-reduced-motion: reduce)': {
                            transition: 'none',
                        },
                    }}
                />
            )}
            {options.map((opt) => {
                const selected = opt.value === value;
                return (
                    <Box
                        key={opt.value}
                        component="button"
                        type="button"
                        role="radio"
                        id={`segmented-pill-${opt.value}`}
                        aria-checked={selected}
                        disabled={opt.disabled}
                        tabIndex={selected ? 0 : -1}
                        onClick={() => {
                            if (!opt.disabled && opt.value !== value) onChange(opt.value);
                        }}
                        sx={{
                            position: 'relative',
                            zIndex: 1,
                            appearance: 'none',
                            border: 0,
                            margin: 0,
                            background: 'transparent',
                            cursor: opt.disabled ? 'default' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 28,
                            px: 1.5,
                            py: 0,
                            // Native buttons keep their own font unless the shorthand is reset.
                            font: 'inherit',
                            fontFamily: 'var(--df-font)',
                            fontSize: 'var(--df-text-md)',
                            fontWeight: 500,
                            lineHeight: 1,
                            letterSpacing: '-0.01em',
                            whiteSpace: 'nowrap',
                            color: selected ? 'text.primary' : 'text.secondary',
                            opacity: opt.disabled ? 0.5 : 1,
                            '&:focus-visible': {
                                outline: '2px solid',
                                outlineColor: 'primary.main',
                                outlineOffset: 2,
                            },
                        }}
                    >
                        {opt.label}
                    </Box>
                );
            })}
        </Box>
    );
}
