"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

function vaultKeyFile(userData) {
  return path.join(userData, "vault-key.bin");
}

function generateFernetKey() {
  return crypto.randomBytes(32).toString("base64").replace(/\+/g, "-").replace(/\//g, "_");
}

function loadOrCreateVaultKey({
  userData,
  isEncryptionAvailable,
  encryptString,
  decryptString,
} = {}) {
  if (!userData) {
    return "";
  }
  const file = vaultKeyFile(userData);
  if (typeof isEncryptionAvailable === "function" && isEncryptionAvailable()) {
    if (fs.existsSync(file)) {
      try {
        const decrypted = decryptString(fs.readFileSync(file));
        if (decrypted) {
          return decrypted;
        }
      } catch {
        // regenerate below
      }
    }
    const key = generateFernetKey();
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, encryptString(key));
    return key;
  }
  if (fs.existsSync(file)) {
    const raw = fs.readFileSync(file, "utf8").trim();
    if (raw) {
      return raw;
    }
  }
  const key = generateFernetKey();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, key, { encoding: "utf8" });
  return key;
}

module.exports = {
  vaultKeyFile,
  generateFernetKey,
  loadOrCreateVaultKey,
};
