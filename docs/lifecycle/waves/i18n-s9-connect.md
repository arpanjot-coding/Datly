# S9 [connect] F-i18n-picker

- Feature: F-i18n-picker
- Host: 01a01b9d-0eb9-7923-8e6b-a469969532b4 (not_found at harvest; sidecar present)
- Sidecar: docs/test-runs/.worker-done/W10-connect.md
- Named: docs/test-runs/i18n-locales-2026-08-19/connect-i18n.md
- Outcome: pass

Forward graph live: allowlist `GET /api/app-config`, first-run gate, `changeLanguage`, Vega sync, `Accept-Language` on agent fetches, empty-key fallback to en.

No dead picker control. No second i18n stack. Model wall independent and still wired.

Residual risk (not catalog P0): LanguageScreen mount/tap `changeLanguage` writes `i18nextLng` before Continue. Kill after tap can look like a returning user on relaunch. Navigator guess does not skip this session (pre-init snapshot).
