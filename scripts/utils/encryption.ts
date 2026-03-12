import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; 

export function encrypt(text: string): string {
  if (!process.env.BACKUP_SECRET) {
    throw new Error('BACKUP_SECRET environment variable is not set');
  }
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = crypto.scryptSync(process.env.BACKUP_SECRET, 'salt', 32);
  const cipher = crypto.createCipheriv(ALGORITHM, new Uint8Array(key), new Uint8Array(iv));
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(text: string): string {
  try {
    if (!process.env.BACKUP_SECRET) {
      console.warn('⚠️ BACKUP_SECRET not set, returning raw text.');
      return text;
    }

    const textParts = text.split(':');
    if (textParts.length !== 2) return text; // Probably not encrypted

    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = textParts.shift()!;
    const key = crypto.scryptSync(process.env.BACKUP_SECRET, 'salt', 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, new Uint8Array(key), new Uint8Array(iv));
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('❌ Decryption failed. The secret might be wrong or the data is corrupted.');
    return text;
  }
}
