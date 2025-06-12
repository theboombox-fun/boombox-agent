import * as crypto from 'crypto';

export class SecureUtilAes {
  static ALGORITHM = 'aes-256-cbc';
  static SECRETKEY = Buffer.from(process.env.AES_SECRET_KEY!, 'utf8');
  static IV = crypto.randomBytes(16);

  static encrypt(data: string): string {
    const cipher = crypto.createCipheriv(this.ALGORITHM, this.SECRETKEY, this.IV);
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return `${this.IV.toString('base64')}:${encrypted}`;
  }

  static decrypt(encryptedData: string): string {
    const [ivBase64, data] = encryptedData.split(':');
    const iv = Buffer.from(ivBase64, 'base64');
    const decipher = crypto.createDecipheriv(this.ALGORITHM, this.SECRETKEY, iv);
    let decrypted = decipher.update(data, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
