/**
 * Generate RSA-2048 key pair for password encryption.
 * Run once: npx tsx scripts/generate-auth-keys.ts
 * Keys are appended to .env automatically.
 */
import { generateKeyPairSync } from "crypto";
import { existsSync, readFileSync, appendFileSync } from "fs";
import { resolve } from "path";

const envPath = resolve(process.cwd(), ".env");
const envContent = existsSync(envPath) ? readFileSync(envPath, "utf-8") : "";

if (envContent.includes("NEXT_PUBLIC_AUTH_RSA_PUBLIC_KEY")) {
  console.log("✅ RSA keys already exist in .env, skipping generation.");
  process.exit(0);
}

const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "der" },
  privateKeyEncoding: { type: "pkcs8", format: "der" },
});

const pubB64 = (publicKey as Buffer).toString("base64");
const privB64 = (privateKey as Buffer).toString("base64");

const block = [
  "",
  "# =============================================================================",
  "# Auth RSA Keys — auto-generated, NEVER commit the private key",
  "# Regenerate: npx tsx scripts/generate-auth-keys.ts",
  "# =============================================================================",
  `NEXT_PUBLIC_AUTH_RSA_PUBLIC_KEY=${pubB64}`,
  `AUTH_RSA_PRIVATE_KEY=${privB64}`,
  "",
].join("\n");

appendFileSync(envPath, block);
console.log("✅ RSA-2048 key pair generated and appended to .env");
