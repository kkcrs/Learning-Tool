/**
 * Server-side RSA-OAEP decryption.
 * Decrypts ciphertext produced by the client-side `encryptForServer()`.
 *
 * This file must ONLY be imported in server actions / server components.
 */

let _privateKey: CryptoKey | null = null;

async function getPrivateKey(): Promise<CryptoKey> {
  if (_privateKey) return _privateKey;

  const raw = process.env.AUTH_RSA_PRIVATE_KEY;
  if (!raw) {
    throw new Error(
      "AUTH_RSA_PRIVATE_KEY is not configured. " +
        "Run: npx tsx scripts/generate-auth-keys.ts"
    );
  }

  // Buffer is available server-side; avoids atob edge cases in Node 18
  const keyData = Uint8Array.from(Buffer.from(raw, "base64"));

  _privateKey = await crypto.subtle.importKey(
    "pkcs8",
    keyData,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["decrypt"]
  );

  return _privateKey;
}

/**
 * Decrypt a base64-encoded ciphertext produced by `encryptForServer`.
 * Returns the original plaintext.
 */
export async function decryptFromClient(ciphertext: string): Promise<string> {
  const key = await getPrivateKey();
  const encrypted = Uint8Array.from(Buffer.from(ciphertext, "base64"));
  const decrypted = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    key,
    encrypted
  );
  return new TextDecoder().decode(decrypted);
}
