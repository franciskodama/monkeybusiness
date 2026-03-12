import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// Use BACKUP_SECRET or fallback to a derivation of AUTH_SECRET or a fixed key
const ENCRYPTION_KEY = process.env.BACKUP_SECRET || 'a-very-secret-key-for-backups-32'; 
const IV_LENGTH = 16; 

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32));
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
  try {
    const textParts = text.split(':');
    if (textParts.length !== 2) return text; // Probably not encrypted

    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.shift()!, 'hex');
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32));
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption failed:', error);
    return text; // Return raw if decryption fails (might be an old unencrypted file)
  }
}
