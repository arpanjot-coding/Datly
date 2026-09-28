import { FC, useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { apiRequest, ApiRequestError } from '../app/apiClient';
import { textVar } from '../app/layout';
import { radius, surface } from '../app/tokens';

type SqlResult = {
    columns: string[];
    rows: unknown[][];
    truncated?: boolean;
};

export const SqlDrawer: FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
    const { t } = useTranslation();
    const [sql, setSql] = useState('SELECT * FROM ');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<SqlResult | null>(null);

    const run = async () => {
        setError(null);
        setResult(null);
        const q = sql.trim();
        if (!q) {
            setError(t('sql.empty', { defaultValue: 'Write a SELECT statement.' }));
            return;
        }
        setBusy(true);
        try {
            const { data } = await apiRequest<SqlResult>('/api/sql/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sql: q }),
            });
            setResult(data);
        } catch (err) {
            const message = err instanceof ApiRequestError
                ? err.apiError.message
                : t('sql.failed', { defaultValue: 'Query failed.' });
            setError(message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontSize: textVar.lg }}>
                {t('sql.title', { defaultValue: 'SQL (read only)' })}
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography sx={{ fontSize: textVar.xs, color: 'text.secondary' }}>
                    {t('sql.hint', { defaultValue: 'SELECT against tables already in this workspace. Writes are blocked.' })}
                </Typography>
                <TextField
                    className="df-no-drag"
                    multiline
                    minRows={5}
                    value={sql}
                    onChange={(e) => setSql(e.target.value)}
                    disabled={busy}
                    placeholder="SELECT * FROM my_table LIMIT 50"
                    sx={{ bgcolor: surface.card, borderRadius: radius.sm }}
                />
                {error && (
                    <Typography color="error" sx={{ fontSize: textVar.sm }}>
                        {error}
                    </Typography>
                )}
                {result && (
                    <Box sx={{ maxHeight: 280, overflow: 'auto', borderRadius: radius.sm }}>
                        {result.rows.length === 0 ? (
                            <Typography sx={{ fontSize: textVar.sm, color: 'text.secondary' }}>
                                {t('sql.noRows', { defaultValue: 'No rows.' })}
                            </Typography>
                        ) : (
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        {result.columns.map((col) => (
                                            <TableCell key={col} sx={{ fontWeight: 600 }}>{col}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {result.rows.map((row, i) => (
                                        <TableRow key={i}>
                                            {row.map((cell, j) => (
                                                <TableCell key={j}>{cell == null ? '' : String(cell)}</TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        {result.truncated && (
                            <Typography sx={{ fontSize: textVar.xs, color: 'text.secondary', mt: 1 }}>
                                {t('sql.truncated', { defaultValue: 'Result truncated.' })}
                            </Typography>
                        )}
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('workspace.cancel', { defaultValue: 'Cancel' })}</Button>
                <Button variant="contained" onClick={run} disabled={busy}>
                    {busy ? t('sql.running', { defaultValue: 'Running...' }) : t('sql.run', { defaultValue: 'Run' })}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
