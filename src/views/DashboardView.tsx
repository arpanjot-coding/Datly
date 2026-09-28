import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
} from '@mui/material';
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined';

import { dfSelectors } from '../app/dfSlice';
import { listDashboards, listSchedules, saveDashboard, saveSchedule, type Dashboard, type PipelineSchedule } from '../app/pipelineApi';
import { borderColor, radius } from '../app/tokens';

export const DashboardView: React.FC = () => {
    const { t } = useTranslation(undefined, { keyPrefix: 'pipeline' });
    const charts = useSelector(dfSelectors.getAllCharts);
    const [dashboards, setDashboards] = useState<Dashboard[]>([]);
    const [schedules, setSchedules] = useState<PipelineSchedule[]>([]);
    const [scheduleOpen, setScheduleOpen] = useState(false);
    const [cron, setCron] = useState('0 8 * * *');

    const refresh = useCallback(async () => {
        setDashboards(await listDashboards());
        setSchedules(await listSchedules());
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const pinCurrentCharts = async () => {
        const tiles = charts.slice(0, 6).map((chart, idx) => ({
            id: `tile-${chart.id}`,
            chart_id: chart.id,
            x: (idx % 2) * 6,
            y: Math.floor(idx / 2) * 4,
            w: 6,
            h: 4,
        }));
        await saveDashboard({
            name: t('dashboard.defaultName'),
            tiles,
            filters: {},
        });
        await refresh();
    };

    const activeDashboard = dashboards[0];
    const chartMap = useMemo(() => new Map(charts.map(c => [c.id, c])), [charts]);

    return (
        <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DashboardCustomizeOutlinedIcon />
                    <Typography variant="h6">{t('dashboard.title')}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" variant="outlined" onClick={() => void pinCurrentCharts()} disabled={charts.length === 0}>
                        {t('dashboard.pinCharts')}
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => setScheduleOpen(true)}>
                        {t('dashboard.addSchedule')}
                    </Button>
                </Box>
            </Box>

            {!activeDashboard && (
                <Typography variant="body2" color="text.secondary">{t('dashboard.empty')}</Typography>
            )}

            {activeDashboard && (
                <Box>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>{activeDashboard.name}</Typography>
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(12, 1fr)',
                        gap: 1.5,
                    }}>
                        {activeDashboard.tiles.map(tile => {
                            const chart = chartMap.get(tile.chart_id);
                            return (
                                <Box
                                    key={tile.id}
                                    sx={{
                                        gridColumn: `span ${tile.w}`,
                                        minHeight: tile.h * 48,
                                        border: `1px solid ${borderColor.divider}`,
                                        borderRadius: radius.md,
                                        p: 1.5,
                                        bgcolor: 'background.paper',
                                    }}
                                >
                                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                                        {chart?.chartType || tile.chart_id}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {chart?.title || t('dashboard.chartPlaceholder')}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            )}

            {schedules.length > 0 && (
                <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>{t('dashboard.schedules')}</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {schedules.map(s => (
                            <Chip key={s.id} label={`${s.name} (${s.cron})`} />
                        ))}
                    </Box>
                </Box>
            )}

            <Dialog open={scheduleOpen} onClose={() => setScheduleOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>{t('dashboard.scheduleTitle')}</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        margin="dense"
                        label={t('dashboard.cron')}
                        value={cron}
                        onChange={e => setCron(e.target.value)}
                        helperText={t('dashboard.cronHint')}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setScheduleOpen(false)}>{t('dashboard.cancel')}</Button>
                    <Button
                        variant="contained"
                        onClick={async () => {
                            await saveSchedule({ name: t('dashboard.dailyRun'), cron, workspace_id: 'default' });
                            setScheduleOpen(false);
                            await refresh();
                        }}
                    >
                        {t('dashboard.saveSchedule')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
