/**
 * Client-side RSA-OAEP encryption.
 * Encrypts sensitive data (passwords) with a public key before sending
 * to the server, so plaintext never appears in the Network tab.
 *
 * Only the server holds the private key to decrypt.
 */

function base64ToUint8Array(base64: string): Uint8Array {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

let _publicKey: CryptoKey | null = null;

async function getPublicKey(): Promise<CryptoKey> {
  if (_publicKey) return _publicKey;

  const raw = process.env.NEXT_PUBLIC_AUTH_RSA_PUBLIC_KEY;
  if (!raw) {
    throw new Error(
      "NEXT_PUBLIC_AUTH_RSA_PUBLIC_KEY is not configured. " +
        "Run: npx tsx scripts/generate-auth-keys.ts"
    );
  }

  const keyData = base64ToUint8Array(raw);
  _publicKey = await crypto.subtle.importKey(
    "spki",
    keyData.buffer as ArrayBuffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"]
  );

  return _publicKey;
}

/**
 * Encrypt a plaintext string with the RSA public key.
 * Returns a base64-encoded ciphertext that only the server can decrypt.
 */
export async function encryptForServer(plaintext: string): Promise<string> {
  const key = await getPublicKey();
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    key,
    encoded
  );
  return uint8ArrayToBase64(new Uint8Array(ciphertext));
}
