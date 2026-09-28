import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    LinearProgress,
    Typography,
} from '@mui/material';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';

import { borderColor, radius, surface } from '../app/tokens';
import { profileTable, type TableProfile } from '../app/pipelineApi';
import { CleanSuggestionsPanel } from './CleanSuggestionsPanel';

interface DataHealthCardProps {
    tableName: string;
    workspaceTableName?: string;
}

function statusColor(status: TableProfile['status']): 'success' | 'warning' | 'error' {
    if (status === 'healthy') return 'success';
    if (status === 'warning') return 'warning';
    return 'error';
}

export const DataHealthCard: React.FC<DataHealthCardProps> = ({ tableName, workspaceTableName }) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'pipeline' });
    const [profile, setProfile] = useState<TableProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const resolvedName = workspaceTableName || tableName;

    const loadProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const next = await profileTable(resolvedName);
            setProfile(next);
        } catch (e) {
            setError(e instanceof Error ? e.message : t('health.loadFailed'));
        } finally {
            setLoading(false);
        }
    }, [resolvedName, t]);

    useEffect(() => {
        void loadProfile();
    }, [loadProfile]);

    if (loading && !profile) {
        return (
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={18} />
                <Typography variant="body2">{t('health.scanning')}</Typography>
            </Box>
        );
    }

    if (error && !profile) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="error">{error}</Typography>
                <Button size="small" onClick={() => void loadProfile()} sx={{ mt: 1 }}>
                    {t('health.retry')}
                </Button>
            </Box>
        );
    }

    if (!profile) return null;

    const issueCount = profile.issues?.length || 0;

    return (
        <Box
            data-health-card=""
            style={{ backgroundColor: '#ffffff' }}
            sx={{
            border: `1px solid ${borderColor.divider}`,
            borderRadius: radius.md,
            p: 2,
            mb: 2,
            backgroundColor: surface.card,
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HealthAndSafetyOutlinedIcon fontSize="small" color={statusColor(profile.status)} />
                    <Typography variant="subtitle2">{t('health.title')}</Typography>
                    <Chip
                        size="small"
                        color={statusColor(profile.status)}
                        label={t('health.score', { score: profile.quality_score })}
                    />
                </Box>
                <Button size="small" onClick={() => void loadProfile()} disabled={loading}>
                    {t('health.rescan')}
                </Button>
            </Box>

            <LinearProgress
                variant="determinate"
                value={profile.quality_score}
                color={statusColor(profile.status)}
                sx={{ mb: 1.5, height: 6, borderRadius: 1 }}
            />

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {issueCount === 0
                    ? t('health.noIssues')
                    : t('health.issueCount', { count: issueCount })}
            </Typography>

            {profile.drift?.schema_changed === true && (
                <Typography variant="body2" sx={{ mb: 1, color: 'warning.main' }}>
                    {t('health.schemaDrift')}
                </Typography>
            )}

            {issueCount > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                    {profile.issues.slice(0, 6).map((issue, idx) => (
                        <Chip
                            key={`${issue.code}-${issue.column || idx}`}
                            size="small"
                            variant="outlined"
                            label={issue.column ? `${issue.column}: ${issue.message}` : issue.message}
                        />
                    ))}
                </Box>
            )}

            <Button
                size="small"
                variant="outlined"
                startIcon={<AutoFixHighOutlinedIcon />}
                onClick={() => setShowSuggestions(v => !v)}
            >
                {showSuggestions ? t('health.hideFixes') : t('health.showFixes')}
            </Button>

            {showSuggestions && (
                <CleanSuggestionsPanel
                    tableId={tableName}
                    workspaceTableName={resolvedName}
                    suggestions={profile.suggestions || []}
                    onApplied={() => void loadProfile()}
                />
            )}
        </Box>
    );
};
