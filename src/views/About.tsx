import { Box, Typography, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { borderColor, radius, shadow, surface } from '../app/tokens';
import { textVar } from '../app/layout';
import { FC } from "react";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

import { toolName } from "../app/App";
import { IslandHeader } from '../components/IslandHeader';
import { IslandShell } from '../components/IslandShell';
import { useTranslation } from 'react-i18next';
import dfLogo from '../assets/df-logo.svg';

const SECTIONS = [
    { id: 'start', titleKey: 'about.startTitle', bodyKey: 'about.startBody', extraKey: 'about.startSteps' },
    { id: 'workspace', titleKey: 'about.workspaceTitle', bodyKey: 'about.workspaceBody', extraKey: 'about.workspaceSteps' },
    { id: 'load', titleKey: 'about.loadTitle', bodyKey: 'about.loadBody', extraKey: 'about.loadSteps' },
    { id: 'ask', titleKey: 'about.askTitle', bodyKey: 'about.askBody', extraKey: 'about.askSteps' },
    { id: 'canvas', titleKey: 'about.canvasTitle', bodyKey: 'about.canvasBody', extraKey: 'about.canvasSteps' },
    { id: 'tables', titleKey: 'about.tablesTitle', bodyKey: 'about.tablesBody', extraKey: 'about.tablesSteps' },
    { id: 'sessions', titleKey: 'about.sessionsTitle', bodyKey: 'about.sessionsBody', extraKey: 'about.sessionsSteps' },
    { id: 'knowledge', titleKey: 'about.knowledgeTitle', bodyKey: 'about.knowledgeBody' },
    { id: 'privacy', titleKey: 'about.privacyTitle', bodyKey: 'about.dataHandlingText' },
] as const;

export const About: FC = function About() {
    const { t } = useTranslation();

    return (
        <IslandShell header={<IslandHeader variant="about" />}>
        <Box
            component="main"
            role="main"
            sx={{
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
                width: '100%',
                height: '100%',
                flex: 1,
                minHeight: 0,
            }}
        >
            <Box sx={{
                margin: 'auto',
                py: { xs: 5, sm: 7 },
                display: "flex",
                flexDirection: "column",
                maxWidth: 760,
                width: '100%',
                px: 3,
            }}>
                <Box component="header" sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                    <Box component="img" src={dfLogo} alt="" sx={{ width: 48, height: 48, flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            component="h1"
                            sx={{
                                fontSize: { xs: 36, sm: 44 },
                                fontWeight: 500,
                                letterSpacing: '-0.04em',
                                lineHeight: 1.05,
                                color: 'text.primary',
                            }}
                        >
                            {t('about.docsTitle', { defaultValue: 'Documentation' })}
                        </Typography>
                        <Typography
                            component="p"
                            sx={{
                                fontSize: textVar.xl,
                                color: 'text.secondary',
                                mt: 1,
                                lineHeight: 1.5,
                                m: 0,
                            }}
                        >
                            {t('about.docsIntro', { defaultValue: 'How to open a project, bring in a table, ask for a chart, and read the result. Follow the sections in order the first time.' })}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, mb: 4, flexWrap: 'wrap' }}>
                    <Button
                        size="large"
                        variant="contained"
                        color="primary"
                        component={RouterLink}
                        to="/app"
                        endIcon={<ArrowForwardIcon aria-hidden="true" />}
                        sx={{ borderRadius: radius.pill, px: 2.5, minHeight: 40, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}
                    >
                        {t('about.tryOnlineDemo', { defaultValue: 'Open workspace' })}
                    </Button>
                    <Button
                        size="large"
                        variant="outlined"
                        component="a"
                        href="#tour"
                        startIcon={<PlayCircleOutlineIcon aria-hidden="true" />}
                        sx={{
                            borderRadius: radius.pill,
                            px: 2.25,
                            minHeight: 40,
                            borderColor: borderColor.view,
                            color: 'text.primary',
                            backgroundColor: surface.card,
                            '&:hover': { borderColor: 'primary.main', backgroundColor: surface.card },
                        }}
                    >
                        {t('about.video', { defaultValue: 'Watch a short tour' })}
                    </Button>
                </Box>

                <Box
                    id="about"
                    component="section"
                    aria-labelledby="about-title"
                    sx={{
                        mb: 4,
                        p: { xs: 2, sm: 2.5 },
                        borderRadius: radius.lg,
                        backgroundColor: surface.card,
                        border: `1px solid ${borderColor.component}`,
                        boxShadow: shadow.sm,
                        scrollMarginTop: 24,
                    }}
                >
                    <Typography id="about-title" component="h2" sx={{ fontSize: { xs: 22, sm: 26 }, fontWeight: 600, letterSpacing: '-0.03em', mb: 1 }}>
                        {t('about.aboutTitle', { defaultValue: 'About' })}
                    </Typography>
                    <Typography component="p" sx={{ fontSize: textVar.lg, color: 'text.secondary', lineHeight: 1.65, m: 0, maxWidth: 640 }}>
                        {t('about.aboutBody', { defaultValue: 'Datly is a local workspace for looking at tables. You load data, ask a question in plain language, and read the chart next to the rows it came from. The work stays on this computer.' })}
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 1.5, mt: 2 }}>
                        {[
                            ['about.aboutLocalTitle', 'On this computer', 'about.aboutLocalBody', 'Projects, tables, and charts are saved as sessions on this machine. You can leave and come back without uploading the file.'],
                            ['about.aboutAskTitle', 'Ask in your own words', 'about.aboutAskBody', 'The prompt at the bottom of the analysis pane turns a question into a thread: the words, the chart, and the table behind it.'],
                            ['about.aboutReadTitle', 'Chart and table together', 'about.aboutReadBody', 'Explore shows the plot and the grid. Reports keep the writing with the chart. Dashboard is where pinned charts collect.'],
                        ].map(([titleKey, titleFallback, bodyKey, bodyFallback]) => (
                            <Box key={titleKey} sx={{ p: 1.5, borderRadius: radius.md, backgroundColor: surface.paper, border: `1px solid ${borderColor.divider}` }}>
                                <Typography component="h3" sx={{ fontSize: textVar.lg, fontWeight: 600, mb: 0.5 }}>
                                    {t(titleKey, { defaultValue: titleFallback })}
                                </Typography>
                                <Typography component="p" sx={{ fontSize: textVar.md, color: 'text.secondary', lineHeight: 1.55, m: 0 }}>
                                    {t(bodyKey, { defaultValue: bodyFallback })}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>

                <Box
                    component="nav"
                    aria-label={t('about.contentsAria', { defaultValue: 'On this page' })}
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1,
                        mb: 4,
                    }}
                >
                    <Box
                        component="a"
                        href="#about"
                        sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: radius.pill,
                            backgroundColor: surface.card,
                            border: `1px solid ${borderColor.divider}`,
                            color: 'text.primary',
                            textDecoration: 'none',
                            fontSize: textVar.sm,
                            fontWeight: 600,
                            '&:hover': { borderColor: 'primary.main' },
                        }}
                    >
                        {t('about.aboutTitle', { defaultValue: 'About' })}
                    </Box>
                    {SECTIONS.map((section) => (
                        <Box
                            key={section.id}
                            component="a"
                            href={`#${section.id}`}
                            sx={{
                                px: 1.5,
                                py: 0.5,
                                borderRadius: radius.pill,
                                backgroundColor: surface.card,
                                border: `1px solid ${borderColor.divider}`,
                                color: 'text.primary',
                                textDecoration: 'none',
                                fontSize: textVar.sm,
                                fontWeight: 600,
                                '&:hover': { borderColor: 'primary.main' },
                            }}
                        >
                            {t(section.titleKey)}
                        </Box>
                    ))}
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {SECTIONS.map((section) => (
                        <Box
                            key={section.id}
                            id={section.id}
                            component="section"
                            aria-labelledby={`${section.id}-title`}
                            sx={{
                                backgroundColor: surface.card,
                                borderRadius: radius.lg,
                                border: `1px solid ${borderColor.component}`,
                                boxShadow: shadow.sm,
                                p: { xs: 2, sm: 2.5 },
                                scrollMarginTop: 24,
                            }}
                        >
                            <Typography
                                component="h2"
                                id={`${section.id}-title`}
                                sx={{ fontSize: { xs: 20, sm: 22 }, fontWeight: 600, letterSpacing: '-0.02em', mb: 1 }}
                            >
                                {t(section.titleKey)}
                            </Typography>
                            <Typography component="p" sx={{ fontSize: textVar.lg, color: 'text.secondary', lineHeight: 1.65, m: 0 }}>
                                {t(section.bodyKey)}
                            </Typography>
                            {'extraKey' in section && (
                                <Typography component="p" sx={{ fontSize: textVar.lg, color: 'text.secondary', lineHeight: 1.65, mt: 1.25, mb: 0 }}>
                                    {t(section.extraKey)}
                                </Typography>
                            )}
                        </Box>
                    ))}
                </Box>

                <Box
                    id="tour"
                    component="section"
                    aria-label={t('about.video', { defaultValue: 'Watch a short tour' })}
                    sx={{
                        mt: 3,
                        backgroundColor: surface.card,
                        borderRadius: radius.lg,
                        border: `1px solid ${borderColor.component}`,
                        boxShadow: shadow.sm,
                        overflow: 'hidden',
                        scrollMarginTop: 24,
                    }}
                >
                    <Box
                        component="video"
                        src="/app-overview.mp4?v=2"
                        controls
                        muted
                        playsInline
                        preload="metadata"
                        sx={{ width: '100%', height: 'auto', display: 'block', backgroundColor: surface.canvas }}
                    />
                    <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                        <Typography component="h2" sx={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', mb: 0.5 }}>
                            {toolName}
                        </Typography>
                        <Typography component="p" sx={{ fontSize: textVar.lg, color: 'text.secondary', lineHeight: 1.6, m: 0 }}>
                            {t('landing.tagline', { defaultValue: 'See the story in your tables.' })}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box
                component="footer"
                role="contentinfo"
                sx={{
                    color: 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 2,
                }}
            >
                <Typography component="span" sx={{ fontSize: textVar.sm }}>
                    {toolName} · {new Date().getFullYear()}
                </Typography>
            </Box>
        </Box>
        </IslandShell>
    );
}
