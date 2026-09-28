"use strict";

const path = require("path");
const { spawn } = require("child_process");
const { isHttpReady, waitUntilReady } = require("./lib.cjs");

const PROJECT_ROOT = path.join(__dirname, "..");
const VITE_URL = "http://127.0.0.1:5173/";

function spawnNodeCli(relCli, args = []) {
  const cli = path.join(PROJECT_ROOT, "node_modules", relCli);
  return spawn(process.execPath, [cli, ...args], {
    cwd: PROJECT_ROOT,
    env: process.env,
    stdio: "inherit",
  });
}

async function main() {
  let viteChild = null;
  if (!(await isHttpReady(VITE_URL))) {
    console.log("[electron:dev] Vite is not on 127.0.0.1:5173, starting Vite...");
    viteChild = spawnNodeCli(path.join("vite", "bin", "vite.js"));
    try {
      await waitUntilReady(VITE_URL, 90000);
    } catch (err) {
      if (viteChild && !viteChild.killed) {
        viteChild.kill();
      }
      throw err;
    }
  } else {
    console.log("[electron:dev] Using existing Vite at", VITE_URL);
  }

  const electronEnv = {
    ...process.env,
    DF_ELECTRON_URL: "http://127.0.0.1:5173",
    ELECTRON_ENABLE_LOGGING: "1",
  };
  const electronCli = path.join(PROJECT_ROOT, "node_modules", "electron", "cli.js");
  const electron = spawn(process.execPath, [electronCli, PROJECT_ROOT], {
    cwd: PROJECT_ROOT,
    env: electronEnv,
    stdio: "inherit",
  });

  electron.on("exit", (code) => {
    process.exit(code ?? 0);
  });
}

main().catch((err) => {
  console.error("[electron:dev]", err instanceof Error ? err.message : err);
  process.exit(1);
});
