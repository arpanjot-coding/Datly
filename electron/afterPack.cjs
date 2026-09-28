"use strict";

const fs = require("fs");
const path = require("path");

/**
 * Flip Electron fuses after pack. Certificate signing is out of band.
 */
exports.default = async function afterPack(context) {
  let flipFuses;
  let FuseVersion;
  let FuseV1Options;
  try {
    ({ flipFuses, FuseVersion, FuseV1Options } = require("@electron/fuses"));
  } catch {
    return;
  }

  const product = context.packager.appInfo.productFilename;
  const platform = context.electronPlatformName;
  let electronBinary;
  if (platform === "darwin") {
    electronBinary = path.join(context.appOutDir, `${product}.app`);
  } else {
    const ext = platform === "win32" ? ".exe" : "";
    electronBinary = path.join(context.appOutDir, `${product}${ext}`);
  }
  if (!fs.existsSync(electronBinary)) {
    return;
  }

  await flipFuses(electronBinary, {
    version: FuseVersion.V1,
    [FuseV1Options.RunAsNode]: false,
    [FuseV1Options.EnableCookieEncryption]: true,
    [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
    [FuseV1Options.EnableNodeCliInspectArguments]: false,
    [FuseV1Options.OnlyLoadAppFromAsar]: true,
  });
};
