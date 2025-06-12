import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { PassThrough } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg from 'fluent-ffmpeg';
import { exec } from 'child_process';
import * as fs from 'fs';
import axios from 'axios';
import { promisify } from 'util';
import * as path from 'path';

const execPromise = promisify(exec);

@Injectable()
export class CloudflareR2Service {
  private readonly ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
  private readonly ACCESS_KEY = process.env.CF_ACCESS_KEY;
  private readonly SECRET_KEY = process.env.CF_SECRET_KEY;

  private readonly s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${this.ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.ACCESS_KEY!,
        secretAccessKey: this.SECRET_KEY!,
      },
    });
  }

  async isSilent(url: string): Promise<boolean> {
    const filePath = `/tmp/audio_${Date.now()}.mp3`;

    const writer = fs.createWriteStream(filePath);
    const response = await axios({ url, method: 'GET', responseType: 'stream' });
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(true));
      writer.on('error', reject);
    });

    const command = `ffmpeg -i "${filePath}" -af volumedetect -f null -`;
    const { stderr } = await execPromise(command);

    fs.unlink(filePath, () => { });

    const volumeMatch = stderr.match(/max_volume:\s*(-?\d+(\.\d+)?) dB/);
    if (!volumeMatch) return true;

    const maxVolume = parseFloat(volumeMatch[1]);
    console.log('Max Volume:', maxVolume);

    return maxVolume <= -50;
  }

  async extractAndUploadAudio(videoUrl: string): Promise<{ url: string, error: string | null }> {
    return new Promise((resolve, reject) => {
      const stream = new PassThrough();
      const buffers: Buffer[] = [];
      let totalSize = 0;
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB

      stream.on('data', (chunk) => {
        buffers.push(chunk);
        totalSize += chunk.length;
        if (totalSize > MAX_SIZE) {
          stream.destroy();
          resolve({ url: '', error: 'Big file' });
        }
      });

      console.log('start');

      ffmpeg(videoUrl)
        .noVideo()
        .audioCodec('libmp3lame')
        .format('mp3')
        .on('error', (err) => {
          console.error('ffmpeg error:', err);
          reject(err);
        })
        .on('end', async () => {
          try {
            if (totalSize > MAX_SIZE) return;
            const audioBuffer = Buffer.concat(buffers);
            const url = await this.uploadBuffer(audioBuffer);
            console.log('upload complete', url);
            resolve({
              url: url || '',
              error: url ? null : 'Upload failed'
            });
          } catch (e) {
            console.error('Upload error:', e);
            reject({ url: null, isSilent: false, error: e.message });
          }
        })
        .pipe(stream, { end: true });
    });
  }

  async extractAndUploadAudioForYoutube(videoUrl: string): Promise<{ url: string; error: string | null }> {
    const cookiePath = path.resolve(__dirname, '../../../assets/youtube-cookies.txt');

    const videoId = videoUrl.match(/v=([a-zA-Z0-9_-]{11})/)?.[1] || uuidv4();
    const tempMp3Path = path.resolve(__dirname, `${videoId}.mp3`);
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB

    try {
      const command = `yt-dlp -x --audio-format mp3 --cookies "${cookiePath}" -o "${tempMp3Path}" "${videoUrl}"`;
      console.log('Downloading audio...');
      await execPromise(command);

      const stats = fs.statSync(tempMp3Path);
      if (stats.size > MAX_SIZE) {
        fs.unlinkSync(tempMp3Path);
        return { url: '', error: 'Big file' };
      }

      const audioBuffer = fs.readFileSync(tempMp3Path);

      const url = await this.uploadBuffer(audioBuffer);
      fs.unlinkSync(tempMp3Path);

      return {
        url: url || '',
        error: url ? null : 'Upload failed'
      };
    } catch (error) {
      console.error('Error during extraction/upload:', error);
      if (fs.existsSync(tempMp3Path)) fs.unlinkSync(tempMp3Path);
      return { url: '', error: error.message };
    }
  }

  async uploadBuffer(buffer: Buffer): Promise<string | null> {

    try {
      const fileName = uuidv4();

      const command = new PutObjectCommand({
        Bucket: 'boombox-sound',
        Key: fileName,
        Body: buffer,
        ContentType: 'audio/mpeg',
      });

      await this.s3.send(command);

      return `https://cdn.theboombox.fun/${fileName}`;
    } catch (e) {
      console.error('Upload error:', e);
      return null;
    }
  }
}

