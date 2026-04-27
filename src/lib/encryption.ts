import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from "node:crypto";

// Ciphertext format: enc:v1:<iv-b64>:<ciphertext+authTag-b64>
// - v1 = key/algorithm version. Bump when rotating algorithms or keys.
// - iv = 12 random bytes (96 bits, GCM standard).
// - ciphertext = AES-256-GCM output, with the 16-byte auth tag appended.
const PREFIX = "enc:v1:";
const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const TAG_LEN = 16;

let cachedKey: Buffer | null = null;

function getKey(): Buffer {
  if (cachedKey) return cachedKey;
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "ENCRYPTION_KEY is not set. Generate one with `openssl rand -hex 32`."
    );
  }
  // Accept either 64-char hex (32 bytes) or any string we hash to 32 bytes.
  // SHA-256 derivation is for convenience in dev — production should use
  // a 64-char hex value generated via `openssl rand -hex 32`.
  let key: Buffer;
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    key = Buffer.from(raw, "hex");
  } else {
    key = createHash("sha256").update(raw).digest();
  }
  if (key.length !== 32) {
    throw new Error("ENCRYPTION_KEY must derive to 32 bytes for AES-256.");
  }
  cachedKey = key;
  return key;
}

export function isEncrypted(value: unknown): value is string {
  return typeof value === "string" && value.startsWith(PREFIX);
}

export function encrypt(plaintext: string): string {
  if (typeof plaintext !== "string") {
    throw new TypeError("encrypt: plaintext must be a string");
  }
  if (isEncrypted(plaintext)) return plaintext; // idempotent
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, getKey(), iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64")}:${Buffer.concat([ct, tag]).toString("base64")}`;
}

export function decrypt(value: string): string {
  if (!isEncrypted(value)) return value; // already plaintext / legacy row
  const body = value.slice(PREFIX.length);
  const sep = body.indexOf(":");
  if (sep < 0) throw new Error("decrypt: malformed ciphertext");
  const iv = Buffer.from(body.slice(0, sep), "base64");
  const ctTag = Buffer.from(body.slice(sep + 1), "base64");
  if (iv.length !== IV_LEN || ctTag.length < TAG_LEN + 1) {
    throw new Error("decrypt: malformed ciphertext components");
  }
  const ct = ctTag.subarray(0, ctTag.length - TAG_LEN);
  const tag = ctTag.subarray(ctTag.length - TAG_LEN);
  const decipher = createDecipheriv(ALGO, getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}

/** Walk a value (object/array/scalar) and decrypt any string matching the encrypted prefix. */
export function decryptDeep<T>(input: T): T {
  if (input === null || input === undefined) return input;
  if (typeof input === "string") {
    return (isEncrypted(input) ? decrypt(input) : input) as T;
  }
  if (Array.isArray(input)) {
    for (let i = 0; i < input.length; i++) {
      input[i] = decryptDeep(input[i]);
    }
    return input;
  }
  if (typeof input === "object") {
    const obj = input as Record<string, unknown>;
    for (const key of Object.keys(obj)) {
      obj[key] = decryptDeep(obj[key]);
    }
    return input;
  }
  return input;
}
