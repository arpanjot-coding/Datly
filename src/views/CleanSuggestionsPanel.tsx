import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import {
    Box,
    Button,
    Chip,
    List,
    ListItem,
    ListItemText,
    Typography,
} from '@mui/material';

import { applyCleanVerb } from '../app/cleanVerbs';
import { applyAllSafeClean } from '../app/hydratePipelineClean';
import type { CleanSuggestion } from '../app/pipelineApi';
import type { AppDispatch } from '../app/store';

interface CleanSuggestionsPanelProps {
    tableId: string;
    workspaceTableName: string;
    suggestions: CleanSuggestion[];
    onApplied?: () => void;
}

export const CleanSuggestionsPanel: React.FC<CleanSuggestionsPanelProps> = ({
    tableId,
    workspaceTableName,
    suggestions,
    onApplied,
}) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'pipeline' });
    const dispatch = useDispatch<AppDispatch>();
    const [busy, setBusy] = useState<string | null>(null);

    const safeSuggestions = suggestions.filter(s => s.auto_safe);
    const allSuggestions = suggestions;

    const applyOne = async (suggestion: CleanSuggestion) => {
        setBusy(suggestion.verb + (suggestion.column || ''));
        try {
            await dispatch(applyCleanVerb({
                tableId,
                verb: suggestion.verb,
                params: suggestion.params,
            }));
            onApplied?.();
        } finally {
            setBusy(null);
        }
    };

    const applyAllSafe = async () => {
        setBusy('all-safe');
        try {
            await dispatch(applyAllSafeClean({ tableId, workspaceTableName }));
            onApplied?.();
        } finally {
            setBusy(null);
        }
    };

    if (allSuggestions.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t('clean.noSuggestions')}
            </Typography>
        );
    }

    return (
        <Box sx={{ mt: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>{t('clean.title')}</Typography>
                {safeSuggestions.length > 0 && (
                    <Button
                        size="small"
                        variant="contained"
                        disabled={busy !== null}
                        onClick={() => void applyAllSafe()}
                    >
                        {t('clean.applySafe')}
                    </Button>
                )}
            </Box>
            <List dense disablePadding>
                {allSuggestions.map((s, idx) => (
                    <ListItem
                        key={`${s.verb}-${s.column || idx}`}
                        secondaryAction={(
                            <Button
                                size="small"
                                disabled={busy !== null}
                                onClick={() => void applyOne(s)}
                            >
                                {t('clean.apply')}
                            </Button>
                        )}
                        sx={{ px: 0 }}
                    >
                        <ListItemText
                            primary={s.reason}
                            secondary={(
                                <Box component="span" sx={{ display: 'inline-flex', gap: 0.5, mt: 0.5 }}>
                                    <Chip size="small" label={s.verb} />
                                    {s.auto_safe && <Chip size="small" color="success" variant="outlined" label={t('clean.safe')} />}
                                </Box>
                            )}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};
