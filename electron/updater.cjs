"use strict";

/**
 * Auto-update wiring. Managed installs can disable checks with
 * DATA_FORMULATOR_MANAGED=1 or DATLY_DISABLE_UPDATES=1.
 */
function updatesDisabled(env = process.env) {
  const managed = (env.DATA_FORMULATOR_MANAGED || "").toLowerCase();
  const disabled = (env.DATLY_DISABLE_UPDATES || "").toLowerCase();
  return ["1", "true", "yes"].includes(managed) || ["1", "true", "yes"].includes(disabled);
}

async function startAutoUpdater({ app, env = process.env, logger = console } = {}) {
  if (!app?.isPackaged) {
    return { started: false, reason: "unpackaged" };
  }
  if (updatesDisabled(env)) {
    logger.log("[updater] disabled by managed policy");
    return { started: false, reason: "managed" };
  }
  let autoUpdater;
  try {
    ({ autoUpdater } = require("electron-updater"));
  } catch (err) {
    logger.warn("[updater] electron-updater is not installed");
    return { started: false, reason: "missing" };
  }
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  try {
    await autoUpdater.checkForUpdatesAndNotify();
    return { started: true, reason: "ok" };
  } catch (err) {
    logger.warn("[updater] check failed", err);
    return { started: false, reason: "error" };
  }
}

module.exports = {
  updatesDisabled,
  startAutoUpdater,
};
