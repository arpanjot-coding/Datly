"use strict";

const path = require("path");
const { app, BrowserWindow, Menu, dialog, shell, globalShortcut, ipcMain, session, safeStorage } = require("electron");
const {
  resolveRuntime,
  spawnBackend,
  stopBackend,
  waitUntilReady,
  generateLaunchToken,
  attachLaunchTokenHeaders,
  isLoopbackUrl,
} = require("./lib.cjs");
const { loadOrCreateVaultKey } = require("./vaultKey.cjs");
const { startAutoUpdater } = require("./updater.cjs");

const launchToken = generateLaunchToken();
ipcMain.on("df-get-launch-token", (event) => {
  event.returnValue = launchToken;
});

const PROJECT_ROOT = path.join(__dirname, "..");
const LOADING_PAGE = path.join(__dirname, "loading.html");
const PRELOAD = path.join(__dirname, "preload.cjs");
const ICON = path.join(
  PROJECT_ROOT,
  "packaging",
  "icons",
  process.platform === "darwin" ? "data-formulator.icns" : "data-formulator.ico",
);

let mainWindow = null;
let backendChild = null;

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (!mainWindow) {
      return;
    }
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.show();
    mainWindow.focus();
  });
}

// Matches the sage lip above the cards so the caption buttons sit in
// that margin instead of on the header.
const TITLEBAR_HEIGHT = 16;

function sendOpenPreferences() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }
  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.show();
  mainWindow.focus();
  mainWindow.webContents.send("open-preferences");
}

function buildMenu() {
  const preferencesItem = {
    label: "Preferences...",
    accelerator: "CommandOrControl+,",
    click: () => sendOpenPreferences(),
  };

  if (process.platform === "darwin") {
    Menu.setApplicationMenu(
      Menu.buildFromTemplate([
        {
          role: "appMenu",
          submenu: [
            { role: "about" },
            { type: "separator" },
            preferencesItem,
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            { role: "hide" },
            { role: "hideOthers" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" },
          ],
        },
        { role: "editMenu" },
      ]),
    );
    return;
  }
  Menu.setApplicationMenu(null);
}

function bindWindowShortcuts(win) {
  if (process.platform === "darwin") {
    return;
  }
  win.webContents.on("before-input-event", (event, input) => {
    if (input.type !== "keyDown") {
      return;
    }
    if (input.isAutoRepeat) {
      return;
    }
    const isComma = input.key === "," || input.code === "Comma";
    if (!isComma) {
      return;
    }
    if (!input.control || input.meta || input.alt || input.shift) {
      return;
    }
    event.preventDefault();
    sendOpenPreferences();
  });
}

async function createWindow() {
  const isWin = process.platform === "win32";
  const isMac = process.platform === "darwin";
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    title: "Datly",
    icon: ICON,
    show: false,
    backgroundColor: "#d5dbd2",
    autoHideMenuBar: true,
    titleBarStyle: isWin || isMac ? "hidden" : "default",
    ...(isMac ? { trafficLightPosition: { x: 16, y: 4 } } : {}),
    ...(isWin
      ? {
          titleBarOverlay: {
            color: "#d5dbd2",
            symbolColor: "#1c231d",
            height: TITLEBAR_HEIGHT,
          },
        }
      : {}),
    webPreferences: {
      preload: PRELOAD,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  bindWindowShortcuts(mainWindow);

  mainWindow.once("ready-to-show", () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (isLoopbackUrl(url)) {
      return;
    }
    event.preventDefault();
    if (/^https?:/.test(url)) {
      shell.openExternal(url);
    }
  });

  mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    console.error("[electron] did-fail-load", { errorCode, errorDescription, validatedURL });
  });
  mainWindow.webContents.on("did-finish-load", () => {
    const url = mainWindow?.webContents.getURL() || "";
    console.log("[electron] loaded", url);
  });

  await mainWindow.loadFile(LOADING_PAGE);
  if (!mainWindow.isVisible()) {
    mainWindow.show();
  }

  try {
    const runtime = await resolveRuntime({
      env: process.env,
      projectRoot: PROJECT_ROOT,
      packaged: app.isPackaged,
    });
    console.log("[electron] runtime", {
      appUrl: runtime.appUrl,
      healthUrl: runtime.healthUrl,
      spawnBackend: runtime.spawnBackend,
      port: runtime.port || null,
    });

    if (runtime.spawnBackend) {
      const vaultKey = loadOrCreateVaultKey({
        userData: app.getPath("userData"),
        isEncryptionAvailable: () => safeStorage.isEncryptionAvailable(),
        encryptString: (value) => safeStorage.encryptString(value),
        decryptString: (value) => safeStorage.decryptString(value),
      });
      backendChild = spawnBackend({
        projectRoot: PROJECT_ROOT,
        host: runtime.host,
        port: runtime.port,
        launchToken,
        packaged: app.isPackaged,
        resourcesPath: process.resourcesPath,
        env: {
          ...process.env,
          DATA_FORMULATOR_HOME: path.join(app.getPath("userData"), "data"),
          CREDENTIAL_VAULT_KEY: vaultKey,
        },
      });
      backendChild.stdout?.on("data", (chunk) => process.stdout.write(chunk));
      backendChild.stderr?.on("data", (chunk) => process.stderr.write(chunk));
      backendChild.on("exit", (code) => {
        console.error("[electron] backend exit", code);
        if (code && code !== 0 && mainWindow && !mainWindow.isDestroyed()) {
          dialog.showErrorBox(
            "Datly",
            `The Python backend exited with code ${code}.`,
          );
        }
      });
    }

    await waitUntilReady(runtime.healthUrl, runtime.spawnBackend ? 120000 : 30000);
    await mainWindow.loadURL(runtime.appUrl);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[electron] start failed", message);
    if (mainWindow && !mainWindow.isDestroyed()) {
      const safe = JSON.stringify(String(message));
      await mainWindow.webContents.executeJavaScript(
        `document.querySelector('.title').textContent = ${safe};`,
      ).catch(() => {});
    }
    dialog.showErrorBox("Datly failed to start", message);
  }
}

app.whenReady().then(async () => {
  attachLaunchTokenHeaders(session.defaultSession, launchToken);
  await startAutoUpdater({ app, env: process.env });
  buildMenu();
  await createWindow();
  if (!app.isPackaged) {
    globalShortcut.register("CommandOrControl+Shift+I", () => {
      mainWindow?.webContents.toggleDevTools();
    });
    globalShortcut.register("CommandOrControl+R", () => {
      mainWindow?.webContents.reload();
    });
  }
  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("before-quit", () => {
  stopBackend(backendChild);
  backendChild = null;
});
