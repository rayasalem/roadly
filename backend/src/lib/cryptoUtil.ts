/**
 * Node.js crypto helpers for encrypting/decrypting sensitive data (e.g. tokens at rest).
 * Uses AES-256-GCM. Requires ENCRYPTION_KEY in env (32 bytes hex or 64 hex chars).
 */
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

function getEncryptionKey(): Buffer | null {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || typeof key !== 'string') return null;
  if (key.length === 64 && /^[0-9a-fA-F]+$/.test(key)) {
    return Buffer.from(key, 'hex');
  }
  return crypto.scryptSync(key, 'mechnow-salt', KEY_LENGTH);
}

/**
 * Encrypt a string. Returns null if ENCRYPTION_KEY is not set (encryption disabled).
 */
export function encryptSensitive(plain: string): string | null {
  const key = getEncryptionKey();
  if (!key) return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${enc.toString('hex')}`;
}

/**
 * Decrypt a string produced by encryptSensitive. Returns null if decryption fails or key not set.
 */
export function decryptSensitive(encrypted: string): string | null {
  const key = getEncryptionKey();
  if (!key) return null;
  const parts = encrypted.split(':');
  if (parts.length !== 3) return null;
  try {
    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const data = Buffer.from(parts[2], 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(data), decipher.final()]);
    return dec.toString('utf8');
  } catch {
    return null;
  }
}
