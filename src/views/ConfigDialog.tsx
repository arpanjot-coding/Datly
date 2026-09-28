import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    ListItemText,
    MenuItem,
    Select,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

import { DataFormulatorState, dfActions, DEFAULT_ROW_LIMIT } from '../app/dfSlice';
import { palettes, defaultPaletteKey, paletteKeys } from '../app/tokens';
import { textVar } from '../app/layout';
import { HOUSE_LOCALE_ALIASES, NATIVE_LANGUAGE_LABELS } from '../i18n/houseLocales';

/**
 * Settings dialog. Renders its own icon-button trigger by default; the
 * compact toolbar hides the trigger and drives `open` from its overflow menu.
 */
export const ConfigDialog: React.FC<{
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    hideTrigger?: boolean;
    focusLanguage?: boolean;
}> = ({ open: openProp, onOpenChange, hideTrigger = false, focusLanguage = false }) => {
    const [openState, setOpenState] = useState(false);
    const open = openProp ?? openState;
    const setOpen = useCallback((value: boolean) => {
        setOpenState(value);
        onOpenChange?.(value);
    }, [onOpenChange]);
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const config = useSelector((state: DataFormulatorState) => state.config);
    const availableLanguages = useSelector(
        (state: DataFormulatorState) => state.serverConfig.AVAILABLE_LANGUAGES
    );
    const managedPolicy = useSelector(
        (state: DataFormulatorState) => state.serverConfig.POLICY
    );
    const rowLimitDefault = DEFAULT_ROW_LIMIT;
    const rowLimitMax = DEFAULT_ROW_LIMIT;
    const showLanguageControl = Boolean(availableLanguages && availableLanguages.length > 1);
    const currentLang = i18n.language.split('-')[0];
    const languageValue = showLanguageControl && availableLanguages.includes(currentLang)
        ? currentLang
        : (availableLanguages?.[0] ?? '');

    useEffect(() => {
        if (!open || !focusLanguage || !showLanguageControl) return;
        const timer = window.setTimeout(() => {
            document.getElementById('config-language')?.focus();
        }, 50);
        return () => window.clearTimeout(timer);
    }, [open, focusLanguage, showLanguageControl]);

    const [formulateTimeoutSeconds, setFormulateTimeoutSeconds] = useState(config.formulateTimeoutSeconds ?? 180);
    const [defaultChartWidth, setDefaultChartWidth] = useState(config.defaultChartWidth ?? 300);
    const [defaultChartHeight, setDefaultChartHeight] = useState(config.defaultChartHeight ?? 300);
    const [maxStretchFactor, setMaxStretchFactor] = useState(config.maxStretchFactor ?? 1.5);
    const [frontendRowLimit, setFrontendRowLimit] = useState(config.frontendRowLimit ?? rowLimitDefault);
    const [paletteKey, setPaletteKey] = useState(
        (config.paletteKey && palettes[config.paletteKey]) ? config.paletteKey : defaultPaletteKey
    );

    const hasChanges = formulateTimeoutSeconds !== config.formulateTimeoutSeconds || 
                      defaultChartWidth !== config.defaultChartWidth ||
                      defaultChartHeight !== config.defaultChartHeight ||
                      maxStretchFactor !== config.maxStretchFactor ||
                      frontendRowLimit !== config.frontendRowLimit ||
                      paletteKey !== ((config.paletteKey && palettes[config.paletteKey]) ? config.paletteKey : defaultPaletteKey);

    return (
        <>
            {!hideTrigger && (
            <Tooltip title={t('app.settings')}>
                <IconButton
                    size="small"
                    onClick={() => setOpen(true)}
                    aria-label={t('app.settings')}
                    sx={{
                        p: 0.5,
                        color: 'text.secondary',
                        '&:hover': { color: 'text.primary', backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                    }}
                >
                    <SettingsOutlinedIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            )}
            <Dialog onClose={() => setOpen(false)} open={open}>
                <DialogTitle>{t('app.settings')}</DialogTitle>
                <DialogContent>
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 3,
                        maxWidth: 400
                    }}>
                        {managedPolicy?.locked?.length ? (
                            <Typography sx={{ fontSize: textVar.sm, color: 'text.secondary' }}>
                                {t('config.managedByAdmin')}
                            </Typography>
                        ) : null}
                        <Divider><Typography variant="caption">{t('config.frontend')}</Typography></Divider>
                        {showLanguageControl && (
                        <FormControl fullWidth size="small" id="config-language-group">
                            <InputLabel id="config-language-label" sx={{ fontSize: textVar.md }}>
                                {t('config.language', { defaultValue: 'Language' })}
                            </InputLabel>
                            <Select
                                labelId="config-language-label"
                                id="config-language"
                                autoFocus={focusLanguage}
                                value={languageValue}
                                label={t('config.language', { defaultValue: 'Language' })}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value) void i18n.changeLanguage(value);
                                }}
                                sx={{ fontSize: textVar.md }}
                            >
                                {availableLanguages.map(lang => (
                                    <MenuItem key={lang} value={lang} sx={{ py: 0.5 }}>
                                        <ListItemText
                                            primary={NATIVE_LANGUAGE_LABELS[HOUSE_LOCALE_ALIASES[lang] || lang] || lang}
                                            slotProps={{ primary: { sx: { fontSize: textVar.md } } }}
                                        />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        )}
                        <FormControl fullWidth size="small">
                            <InputLabel id="palette-select-label" sx={{ fontSize: textVar.md }}>{t('config.colorTheme')}</InputLabel>
                            <Select
                                labelId="palette-select-label"
                                value={paletteKey}
                                label={t('config.colorTheme')}
                                onChange={(e) => setPaletteKey(e.target.value)}
                                sx={{ fontSize: textVar.md }}
                                renderValue={(key) => {
                                    const p = palettes[key];
                                    return (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: p.primary.main, flexShrink: 0 }} />
                                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: p.custom.main, flexShrink: 0 }} />
                                            <Typography sx={{ fontSize: textVar.md }}>{p.name}</Typography>
                                        </Box>
                                    );
                                }}
                            >
                                {paletteKeys.map(key => {
                                    const p = palettes[key];
                                    return (
                                        <MenuItem key={key} value={key} sx={{ py: 0.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1.5 }}>
                                                <Box sx={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: p.primary.main, border: '1px solid rgba(0,0,0,0.1)' }} />
                                                <Box sx={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: p.custom.main, border: '1px solid rgba(0,0,0,0.1)' }} />
                                            </Box>
                                            <ListItemText primary={p.name} slotProps={{ primary: { sx: { fontSize: textVar.md } } }} />
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                                <TextField
                                    label={t('config.defaultChartWidth')}
                                    type="number"
                                    variant="outlined"
                                    value={defaultChartWidth}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        setDefaultChartWidth(value);
                                    }}
                                    fullWidth
                                    slotProps={{
                                        input: {
                                            inputProps: {
                                                min: 100,
                                                max: 1000
                                            }
                                        }
                                    }}
                                    error={defaultChartWidth < 100 || defaultChartWidth > 1000}
                                    helperText={defaultChartWidth < 100 || defaultChartWidth > 1000 ? 
                                        t('config.chartSizeRangeError') : ""}
                                />
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                <ClearIcon fontSize="small" />
                            </Typography>
                            <Box sx={{ flex: 1 }}>
                                <TextField
                                    label={t('config.defaultChartHeight')}
                                    type="number"
                                    variant="outlined"
                                    value={defaultChartHeight}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        setDefaultChartHeight(value);
                                    }}
                                    fullWidth
                                    slotProps={{
                                        input: {
                                            inputProps: {
                                                min: 100,
                                                max: 1000
                                            }
                                        }
                                    }}
                                    error={defaultChartHeight < 100 || defaultChartHeight > 1000}
                                    helperText={defaultChartHeight < 100 || defaultChartHeight > 1000 ? 
                                        t('config.chartSizeRangeError') : ""}
                                />
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                                <TextField
                                    label={t('config.localRowLimit')}
                                    type="number"
                                    variant="outlined"
                                    value={frontendRowLimit}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        setFrontendRowLimit(value);
                                    }}
                                    fullWidth
                                    slotProps={{
                                        input: {
                                            inputProps: {
                                                min: 100,
                                                max: rowLimitMax
                                            }
                                        }
                                    }}
                                    error={frontendRowLimit < 100 || frontendRowLimit > rowLimitMax}
                                    helperText={frontendRowLimit < 100 || frontendRowLimit > rowLimitMax ? 
                                        t('config.localRowLimitRangeError') : ""}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    {t('config.localRowLimitHint')}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                                <TextField
                                    label={t('config.maxStretchFactor')}
                                    type="number"
                                    variant="outlined"
                                    value={maxStretchFactor}
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value);
                                        setMaxStretchFactor(value);
                                    }}
                                    fullWidth
                                    slotProps={{
                                        input: {
                                            inputProps: {
                                                min: 1,
                                                max: 5,
                                                step: 0.1
                                            }
                                        }
                                    }}
                                    error={isNaN(maxStretchFactor) || maxStretchFactor < 1 || maxStretchFactor > 5}
                                    helperText={isNaN(maxStretchFactor) || maxStretchFactor < 1 || maxStretchFactor > 5 ? 
                                        t('config.maxStretchFactorRangeError') : ""}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    {t('config.maxStretchFactorHint')}
                                </Typography>
                            </Box>
                        </Box>
                        <Divider><Typography variant="caption">{t('config.backend')}</Typography></Divider>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                                <TextField
                                    label={t('config.formulateTimeout')}
                                    type="number"
                                    variant="outlined"
                                    value={formulateTimeoutSeconds}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        setFormulateTimeoutSeconds(value);
                                    }}
                                    inputProps={{
                                        min: 0,
                                        max: 3600,
                                    }}
                                    error={formulateTimeoutSeconds <= 0 || formulateTimeoutSeconds > 3600}
                                    helperText={formulateTimeoutSeconds <= 0 || formulateTimeoutSeconds > 3600 ? 
                                        t('config.formulateTimeoutRangeError') : ""}
                                    fullWidth
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    {t('config.formulateTimeoutHint')}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{'.MuiButton-root': {textTransform: 'none'}}}>
                    <Button sx={{marginRight: 'auto'}} onClick={() => {
                        setFormulateTimeoutSeconds(180);
                        setDefaultChartWidth(300);
                        setDefaultChartHeight(300);
                        setMaxStretchFactor(2.0);
                        setFrontendRowLimit(rowLimitDefault);
                        setPaletteKey(defaultPaletteKey);
                    }}>{t('session.resetToDefault')}</Button>
                    <Button onClick={() => setOpen(false)}>{t('app.cancel')}</Button>
                    <Button 
                        variant={hasChanges ? "contained" : "text"}
                        disabled={!hasChanges || isNaN(formulateTimeoutSeconds) || formulateTimeoutSeconds <= 0 || formulateTimeoutSeconds > 3600
                            || isNaN(defaultChartWidth) || defaultChartWidth <= 0 || defaultChartWidth > 1000
                            || isNaN(defaultChartHeight) || defaultChartHeight <= 0 || defaultChartHeight > 1000
                            || isNaN(maxStretchFactor) || maxStretchFactor < 1 || maxStretchFactor > 5
                            || isNaN(frontendRowLimit) || frontendRowLimit < 100 || frontendRowLimit > rowLimitMax}
                        onClick={() => {
                            dispatch(dfActions.setConfig({formulateTimeoutSeconds, defaultChartWidth, defaultChartHeight, maxStretchFactor, frontendRowLimit, paletteKey}));
                            setOpen(false);
                        }}
                    >
                        {t('app.apply')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );  
};
