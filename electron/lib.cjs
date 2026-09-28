"use strict";

const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const net = require("net");
const path = require("path");
const { spawn } = require("child_process");

function generateLaunchToken() {
  return crypto.randomBytes(32).toString("hex");
}

function withDesktopQuery(urlString) {
  const url = new URL(urlString);
  if (url.searchParams.get("desktop") !== "1") {
    url.searchParams.set("desktop", "1");
  }
  return url.toString();
}

function candidateUrls(urlString) {
  const url = new URL(urlString);
  const hosts = [];
  const seen = new Set();
  const add = (host) => {
    if (seen.has(host)) {
      return;
    }
    seen.add(host);
    const next = new URL(url.toString());
    next.hostname = host;
    hosts.push(next.toString());
  };
  add(url.hostname);
  if (url.hostname === "127.0.0.1" || url.hostname === "localhost") {
    add("127.0.0.1");
    add("localhost");
  }
  return hosts;
}

async function firstReachableUrl(urls, probe = isHttpReady) {
  for (const url of urls) {
    if (await probe(url)) {
      return url;
    }
  }
  return null;
}

function pickFreePort(host = "127.0.0.1") {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, host, () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(port);
      });
    });
  });
}

function isHttpReady(urlString, timeoutMs = 1000) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
      if (settled) {
        return;
      }
      settled = true;
      resolve(value);
    };
    const req = http.get(urlString, { timeout: timeoutMs }, (res) => {
      res.resume();
      finish((res.statusCode || 0) >= 200 && (res.statusCode || 0) < 500);
    });
    req.on("timeout", () => {
      req.destroy();
      finish(false);
    });
    req.on("error", () => finish(false));
  });
}

async function waitUntilReady(urlString, timeoutMs = 60000, intervalMs = 250) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isHttpReady(urlString)) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(`Datly did not become ready at ${urlString}`);
}

function pythonCommand(projectRoot, platform = process.platform, resourcesPath, packaged = false) {
  const sidecarNames = platform === "win32"
    ? ["data_formulator.exe", "Datly.exe"]
    : ["data_formulator", "Datly"];
  if (resourcesPath) {
    for (const sidecarName of sidecarNames) {
      const sidecar = path.join(resourcesPath, "sidecar", sidecarName);
      if (fs.existsSync(sidecar)) {
        return { command: sidecar, argsPrefix: [] };
      }
    }
  }
  if (packaged) {
    return { command: sidecarNames[0], argsPrefix: [], missingSidecar: true };
  }
  const venvDir = path.join(projectRoot, ".venv");
  if (platform === "win32") {
    const exe = path.join(venvDir, "Scripts", "data_formulator.exe");
    if (fs.existsSync(exe)) {
      return { command: exe, argsPrefix: [] };
    }
    const python = path.join(venvDir, "Scripts", "python.exe");
    if (fs.existsSync(python)) {
      return { command: python, argsPrefix: ["-m", "data_formulator"] };
    }
  } else {
    const bin = path.join(venvDir, "bin", "data_formulator");
    if (fs.existsSync(bin)) {
      return { command: bin, argsPrefix: [] };
    }
    const python = path.join(venvDir, "bin", "python");
    if (fs.existsSync(python)) {
      return { command: python, argsPrefix: ["-m", "data_formulator"] };
    }
  }
  return { command: "uv", argsPrefix: ["run", "data_formulator"] };
}

function backendEnv({ env = process.env, port, launchToken, packaged = false } = {}) {
  const next = {
    ...env,
    DATA_FORMULATOR_DESKTOP: "1",
    DATA_FORMULATOR_PORT: String(port),
  };
  if (launchToken) {
    next.DATA_FORMULATOR_LAUNCH_TOKEN = launchToken;
  }
  if (packaged) {
    next.DATA_FORMULATOR_PACKAGED = "1";
    delete next.DATA_FORMULATOR_DEV_TRUST;
  } else if (!next.DATA_FORMULATOR_DEV_TRUST) {
    next.DATA_FORMULATOR_DEV_TRUST = "1";
  }
  return next;
}

function spawnBackend({
  projectRoot,
  host,
  port,
  env = process.env,
  platform = process.platform,
  launchToken,
  packaged = false,
  resourcesPath,
}) {
  const { command, argsPrefix, missingSidecar } = pythonCommand(
    projectRoot,
    platform,
    resourcesPath,
    packaged,
  );
  if (missingSidecar) {
    throw new Error("Packaged Datly is missing the Python sidecar.");
  }
  const args = [...argsPrefix, "--host", host, "--port", String(port)];
  const child = spawn(command, args, {
    cwd: projectRoot,
    env: backendEnv({ env, port, launchToken, packaged }),
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  return child;
}

function stopBackend(child, platform = process.platform) {
  if (!child || child.killed) {
    return;
  }
  if (platform === "win32" && child.pid) {
    spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
      stdio: "ignore",
      windowsHide: true,
    });
    return;
  }
  child.kill("SIGTERM");
}

async function resolveRuntime({
  env = process.env,
  projectRoot,
  probe = isHttpReady,
  packaged = false,
} = {}) {
  const explicit = env.DF_ELECTRON_URL || env.ELECTRON_START_URL;
  if (explicit) {
    const reachable = await firstReachableUrl(candidateUrls(explicit), probe);
    const appUrl = withDesktopQuery(reachable || explicit);
    return { appUrl, spawnBackend: false, healthUrl: reachable || appUrl };
  }

  if (!packaged) {
    const vite = await firstReachableUrl(
      ["http://127.0.0.1:5173/", "http://localhost:5173/"],
      probe,
    );
    if (vite) {
      return {
        appUrl: withDesktopQuery(vite),
        spawnBackend: false,
        healthUrl: vite,
      };
    }

    const api = await firstReachableUrl(
      ["http://127.0.0.1:5567/api/auth/info", "http://localhost:5567/api/auth/info"],
      probe,
    );
    if (api) {
      const origin = new URL(api).origin + "/";
      return {
        appUrl: withDesktopQuery(origin),
        spawnBackend: false,
        healthUrl: api,
      };
    }
  }

  const port = await pickFreePort();
  const origin = `http://127.0.0.1:${port}`;
  return {
    appUrl: withDesktopQuery(`${origin}/`),
    spawnBackend: true,
    host: "127.0.0.1",
    port,
    healthUrl: `${origin}/api/auth/info`,
    projectRoot,
  };
}

function attachLaunchTokenHeaders(ses, token) {
  if (!ses?.webRequest || !token) {
    return;
  }
  ses.webRequest.onBeforeSendHeaders((details, callback) => {
    const headers = { ...details.requestHeaders };
    try {
      const host = new URL(details.url).hostname;
      if (host === "127.0.0.1" || host === "localhost") {
        headers["X-Datly-Launch-Token"] = token;
      }
    } catch {
      // ignore invalid URLs
    }
    callback({ requestHeaders: headers });
  });
}

function isLoopbackUrl(urlString) {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol === "file:") {
      return true;
    }
    return parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost";
  } catch {
    return false;
  }
}

module.exports = {
  withDesktopQuery,
  candidateUrls,
  firstReachableUrl,
  pickFreePort,
  isHttpReady,
  waitUntilReady,
  pythonCommand,
  generateLaunchToken,
  backendEnv,
  spawnBackend,
  stopBackend,
  resolveRuntime,
  attachLaunchTokenHeaders,
  isLoopbackUrl,
};
