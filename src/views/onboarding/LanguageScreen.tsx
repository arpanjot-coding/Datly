import React, { FC, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import PublicIcon from '@mui/icons-material/Public';
import { useTranslation } from 'react-i18next';
import { borderColor, radius, shadow, surface, transition } from '../../app/tokens';
import { textVar } from '../../app/layout';
import { persistI18nextLng, restoreI18nextLngToPreInit, setLanguageCompleted } from '../../i18n/localePersist';
import { HOUSE_LOCALE_ALIASES, NATIVE_LANGUAGE_LABELS } from '../../i18n/houseLocales';

export interface LanguageScreenProps {
    availableLanguages: string[];
    onContinue: () => void;
}

function navigatorLanguageBase(): string {
    if (typeof navigator === 'undefined' || !navigator.language) return 'en';
    return navigator.language.split('-')[0];
}

export const LanguageScreen: FC<LanguageScreenProps> = function LanguageScreen({
    availableLanguages,
    onContinue,
}) {
    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const accent = theme.palette.primary.main;
    const languages = [...new Set(availableLanguages.map((id) => HOUSE_LOCALE_ALIASES[id] || id))].filter(
        (id) => id in NATIVE_LANGUAGE_LABELS,
    );
    const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const continueRef = useRef<HTMLButtonElement | null>(null);
    const previewSeq = useRef(0);

    const [selected, setSelected] = useState(() => {
        const base = navigatorLanguageBase();
        return languages.includes(base) ? base : 'en';
    });

    // Live t() preview only. Restore pre-init i18nextLng so a kill cannot skip the picker.
    const previewLanguage = (id: string) => {
        const seq = ++previewSeq.current;
        void i18n.changeLanguage(id).finally(() => {
            if (seq !== previewSeq.current) return;
            restoreI18nextLngToPreInit();
        });
    };

    useEffect(() => {
        previewLanguage(selected);
        const index = Math.max(0, languages.indexOf(selected));
        cardRefs.current[index]?.focus();
    }, []);

    const selectLanguage = (id: string) => {
        setSelected(id);
        previewLanguage(id);
    };

    const focusCard = (index: number) => {
        cardRefs.current[index]?.focus();
    };

    const handleContinue = () => {
        previewSeq.current += 1;
        persistI18nextLng(selected);
        setLanguageCompleted(true);
        void i18n.changeLanguage(selected);
        onContinue();
    };

    const handleDialogKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        if (event.key !== 'Tab') return;

        const cards = cardRefs.current.filter((el): el is HTMLButtonElement => el != null);
        const focusables = continueRef.current ? [...cards, continueRef.current] : cards;
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (event.shiftKey && active === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && active === last) {
            event.preventDefault();
            first.focus();
        }
    };

    const handleCardKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            selectLanguage(languages[index]);
            return;
        }

        const last = languages.length - 1;
        if (last < 0) return;

        let nextIndex: number | null = null;
        if (event.key === 'ArrowDown') {
            nextIndex = Math.min(index + 1, last);
        } else if (event.key === 'ArrowUp') {
            nextIndex = Math.max(index - 1, 0);
        } else if (event.key === 'Home') {
            nextIndex = 0;
        } else if (event.key === 'End') {
            nextIndex = last;
        }

        if (nextIndex === null) return;

        event.preventDefault();
        selectLanguage(languages[nextIndex]);
        focusCard(nextIndex);
    };

    return (
        <Box
            role="dialog"
            aria-modal="true"
            aria-labelledby="language-screen-title"
            onKeyDown={handleDialogKeyDown}
            sx={{
                position: 'fixed',
                inset: 0,
                zIndex: 2000,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: surface.canvas,
                WebkitAppRegion: 'drag',
                '& button, & [role="button"]': {
                    WebkitAppRegion: 'no-drag',
                },
            }}
        >
            <Box sx={{ height: 52, flexShrink: 0, WebkitAppRegion: 'drag' }} />
            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    px: 3,
                    pb: 3,
                }}
            >
                <Box
                    sx={{
                        width: 52,
                        height: 52,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: surface.paper,
                        border: `1px solid ${borderColor.component}`,
                        color: surface.ink,
                        mb: 2,
                    }}
                >
                    <PublicIcon sx={{ fontSize: 28 }} />
                </Box>
                <Typography
                    id="language-screen-title"
                    component="h1"
                    sx={{
                        fontSize: 22,
                        fontWeight: 500,
                        letterSpacing: '-0.02em',
                        color: surface.ink,
                        textAlign: 'center',
                    }}
                >
                    {t('onboarding.languageTitle')}
                </Typography>
                <Typography
                    sx={{
                        mt: 1,
                        mb: 3,
                        fontSize: textVar.md,
                        color: surface.muted,
                        textAlign: 'center',
                        maxWidth: 360,
                    }}
                >
                    {t('onboarding.languageIntro')}
                </Typography>
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: 360,
                        flex: 1,
                        minHeight: 0,
                        overflow: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        WebkitAppRegion: 'no-drag',
                    }}
                >
                    {languages.map((id, index) => {
                        const isSelected = id === selected;
                        return (
                            <Box
                                key={id}
                                component="button"
                                type="button"
                                tabIndex={0}
                                ref={(el: HTMLButtonElement | null) => {
                                    cardRefs.current[index] = el;
                                }}
                                onClick={() => selectLanguage(id)}
                                onKeyDown={(event) => handleCardKeyDown(event, index)}
                                aria-pressed={isSelected}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                    px: 2,
                                    py: 1.5,
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    font: 'inherit',
                                    fontSize: textVar.lg,
                                    color: surface.ink,
                                    backgroundColor: isSelected ? theme.palette.primary.bgcolor ?? surface.card : surface.card,
                                    borderRadius: radius.md,
                                    border: `2px solid ${isSelected ? accent : borderColor.component}`,
                                    boxShadow: isSelected ? shadow.sm : 'none',
                                    outline: 'none',
                                    transition: transition.fast,
                                    WebkitAppRegion: 'no-drag',
                                    '&:hover': {
                                        borderColor: accent,
                                    },
                                    '&:focus-visible': {
                                        outline: `2px solid ${accent}`,
                                        outlineOffset: 2,
                                    },
                                }}
                            >
                                <span>{NATIVE_LANGUAGE_LABELS[id]}</span>
                                {isSelected ? <CheckIcon sx={{ fontSize: 18, color: accent }} /> : null}
                            </Box>
                        );
                    })}
                </Box>
                <Button
                    ref={continueRef}
                    type="button"
                    variant="contained"
                    color="primary"
                    onClick={handleContinue}
                    sx={{
                        mt: 2,
                        width: '100%',
                        maxWidth: 360,
                        flexShrink: 0,
                        WebkitAppRegion: 'no-drag',
                        '&:focus-visible': {
                            outline: `2px solid ${accent}`,
                            outlineOffset: 2,
                        },
                    }}
                >
                    {t('onboarding.continue')}
                </Button>
            </Box>
        </Box>
    );
};
