"use strict";

const { contextBridge, ipcRenderer } = require("electron");

let launchToken = "";
try {
  launchToken = ipcRenderer.sendSync("df-get-launch-token") || "";
} catch {
  launchToken = "";
}

contextBridge.exposeInMainWorld("electronAPI", {
  isDesktop: true,
  platform: process.platform,
  titleBarOverlay: process.platform === "win32" || process.platform === "darwin",
  // Caption buttons live in the sage lip, not inside the header.
  titleBarHeight: 0,
  captionInset: 0,
  trafficInset: process.platform === "darwin" ? 78 : 0,
  launchToken,
  idleLockMs: 15 * 60 * 1000,
  onOpenPreferences: (callback) => {
    const listener = () => {
      callback();
    };
    ipcRenderer.on("open-preferences", listener);
    return () => {
      ipcRenderer.removeListener("open-preferences", listener);
    };
  },
});
