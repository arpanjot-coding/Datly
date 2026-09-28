import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Chip,
    CircularProgress,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Tooltip,
    Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

import { listPipelineRuns, type PipelineRun } from '../app/pipelineApi';
import { borderColor, radius } from '../app/tokens';

function statusChipColor(status: PipelineRun['status']): 'default' | 'success' | 'warning' | 'error' {
    if (status === 'completed') return 'success';
    if (status === 'running') return 'warning';
    if (status === 'failed') return 'error';
    return 'default';
}

export const PipelineRunsPanel: React.FC = () => {
    const { t } = useTranslation(undefined, { keyPrefix: 'pipeline' });
    const [runs, setRuns] = useState<PipelineRun[]>([]);
    const [loading, setLoading] = useState(false);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            setRuns(await listPipelineRuns(15));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    return (
        <Box sx={{
            borderTop: `1px solid ${borderColor.divider}`,
            pt: 1.5,
            mt: 1.5,
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PlayCircleOutlineIcon fontSize="small" />
                    <Typography variant="subtitle2">{t('runs.title')}</Typography>
                </Box>
                <Tooltip title={t('runs.refresh')}>
                    <span>
                        <IconButton size="small" onClick={() => void refresh()} disabled={loading}>
                            {loading ? <CircularProgress size={16} /> : <RefreshIcon fontSize="small" />}
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>

            {runs.length === 0 && !loading && (
                <Typography variant="body2" color="text.secondary">{t('runs.empty')}</Typography>
            )}

            <List dense disablePadding>
                {runs.map(run => (
                    <ListItem key={run.id} sx={{ px: 0, alignItems: 'flex-start' }}>
                        <ListItemText
                            primary={(
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                                    <Chip size="small" label={run.trigger} />
                                    <Chip size="small" color={statusChipColor(run.status)} label={run.status} />
                                </Box>
                            )}
                            secondary={(
                                <Typography variant="caption" color="text.secondary" component="span">
                                    {run.steps.map(s => s.step_type).join(' → ')}
                                </Typography>
                            )}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};
