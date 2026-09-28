import React, { useCallback, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { borderColor, radius, status, surface, transition } from '../app/tokens';
import { textVar } from '../app/layout';
import { ThreadIdentity, threadSectionId } from './threadIdentity';

export function threadDetailLabel(
    identity: ThreadIdentity,
    t: (key: string, opts?: Record<string, unknown>) => string,
): string {
    if (identity.kind === 'question') {
        return t('dataThread.fromQuestion', { defaultValue: 'Started from your question' });
    }
    if (identity.kind === 'source') {
        return t('dataThread.fromSource', {
            name: identity.tableName,
            defaultValue: `On ${identity.tableName}`,
        });
    }
    return t('dataThread.resultTable', {
        name: identity.tableName,
        defaultValue: identity.tableName,
    });
}

export const ThreadPaneNav: React.FC<{
    items: ThreadIdentity[];
    activeKey?: string;
    onSelect: (key: string) => void;
}> = ({ items, activeKey, onSelect }) => {
    const { t } = useTranslation();
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

    const activeIndex = Math.max(0, items.findIndex((item) => item.key === activeKey));
    const focusTab = useCallback((index: number) => {
        tabRefs.current[index]?.focus();
    }, []);

    const moveTo = useCallback((index: number) => {
        const next = items[index];
        if (!next) return;
        onSelect(next.key);
        focusTab(index);
    }, [items, onSelect, focusTab]);

    const onKeyDown = (event: React.KeyboardEvent, index: number) => {
        const last = items.length - 1;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            event.preventDefault();
            moveTo(index === last ? 0 : index + 1);
            return;
        }
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            event.preventDefault();
            moveTo(index === 0 ? last : index - 1);
            return;
        }
        if (event.key === 'Home') {
            event.preventDefault();
            moveTo(0);
            return;
        }
        if (event.key === 'End') {
            event.preventDefault();
            moveTo(last);
        }
    };

    if (items.length === 0) return null;

    const navLabel = t('dataThread.paneNav', { defaultValue: 'Jump to an analysis thread' });

    return (
        <Box
            component="nav"
            aria-label={navLabel}
            sx={{
                flexShrink: 0,
                px: 1.25,
                pt: 1,
                pb: 0.75,
                borderBottom: `1px solid ${borderColor.divider}`,
                backgroundColor: surface.paper,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, minWidth: 0, mb: 0.75 }}>
                <Typography
                    component="h2"
                    sx={{
                        fontSize: textVar.sm,
                        fontWeight: 650,
                        color: 'text.primary',
                        letterSpacing: '-0.01em',
                        lineHeight: 1.3,
                    }}
                >
                    {t('dataThread.paneTitle', { defaultValue: 'Analysis' })}
                </Typography>
                <Typography sx={{ fontSize: textVar.xxs, color: 'text.secondary' }}>
                    {t('dataThread.threadCount', { count: items.length })}
                </Typography>
            </Box>
            <Box
                role="tablist"
                aria-label={navLabel}
                sx={{
                    display: 'flex',
                    alignItems: 'stretch',
                    gap: 0.5,
                    overflowX: 'auto',
                    pb: 0.25,
                }}
            >
                {items.map((item, index) => {
                    const selected = item.key === activeKey || (activeKey == null && index === activeIndex);
                    const detail = threadDetailLabel(item, t);
                    const title = t('dataThread.threadTitle', {
                        index: item.index,
                        defaultValue: `Thread ${item.index}`,
                    });
                    return (
                        <Box
                            key={item.key}
                            component="button"
                            type="button"
                            role="tab"
                            id={`thread-nav-${item.key}`}
                            aria-controls={threadSectionId(item.key)}
                            aria-selected={selected}
                            tabIndex={selected ? 0 : -1}
                            aria-label={t('dataThread.jumpToThread', {
                                index: item.index,
                                label: detail,
                                defaultValue: `Jump to thread ${item.index}, ${detail}`,
                            })}
                            ref={(el: HTMLButtonElement | null) => { tabRefs.current[index] = el; }}
                            onClick={() => onSelect(item.key)}
                            onKeyDown={(event) => onKeyDown(event, index)}
                            sx={{
                                appearance: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.75,
                                minWidth: 0,
                                maxWidth: 220,
                                px: 0.75,
                                py: 0.5,
                                borderRadius: radius.md,
                                border: `1px solid ${selected ? status.active.border : borderColor.component}`,
                                backgroundColor: selected ? status.active.bg : surface.card,
                                color: selected ? status.active.fg : 'text.primary',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: transition.fast,
                                '&:hover': {
                                    borderColor: selected ? status.active.border : 'rgba(28, 35, 29, 0.18)',
                                    backgroundColor: selected ? status.active.bg : surface.overlay,
                                },
                                '&:focus-visible': {
                                    outline: `2px solid ${status.active.border}`,
                                    outlineOffset: 2,
                                },
                            }}
                        >
                            <Box
                                aria-hidden
                                sx={{
                                    width: 18,
                                    height: 18,
                                    flexShrink: 0,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 10,
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    backgroundColor: selected ? status.active.fg : 'rgba(28, 35, 29, 0.08)',
                                    color: selected ? surface.card : 'text.secondary',
                                }}
                            >
                                {item.index}
                            </Box>
                            <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                                <Typography
                                    component="span"
                                    sx={{
                                        fontSize: textVar.xxs,
                                        fontWeight: 650,
                                        lineHeight: 1.2,
                                        color: 'inherit',
                                    }}
                                >
                                    {title}
                                </Typography>
                                <Typography
                                    component="span"
                                    sx={{
                                        fontSize: textVar.xxs,
                                        lineHeight: 1.25,
                                        color: selected ? status.active.fg : 'text.secondary',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {detail}
                                </Typography>
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};
