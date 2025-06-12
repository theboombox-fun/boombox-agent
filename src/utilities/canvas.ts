import { Resvg } from '@resvg/resvg-js';
import { createCanvas } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';
import { CloudflareImageService } from '../api/cloudflare/cloudflare-image.service.js';
import Svg from './svg.js';

export async function generateThumbnail(cloudflareImageService: CloudflareImageService, name: string, ticker: string, creator_wallet_address: string, pfp_url: string, ): Promise<string | null> {
  try {
    const svgPath = path.join(process.cwd(), 'assets/token_thumb.svg');
 
    const modifiedTicker = ticker.toUpperCase();
    const tokenName = name!.toUpperCase();
    let username = creator_wallet_address!.slice(0, 4) + "..." + creator_wallet_address!.slice(-4);
    if (!username.startsWith('0x')) {
      username = "@" + username;
    }

    const usernameWidth = measureTextWidth(username, '37px "Inter Display"');
    const tokenNameWidth = measureTextWidth(tokenName, '98px "Inter Display"') + 36; 

    const svgTemplate = fs.readFileSync(svgPath, 'utf-8')
      .replace('{TICKER}', "$" + modifiedTicker)
      .replace('{USERNAME}', username)
      .replace('{TOKEN_NAME}', tokenName)
      .replace('{TOKEN_IMAGE}', await Svg.downloadImageAsBase64(pfp_url))
      .replace('{USERNAME_WIDTH}', usernameWidth.toString())
      .replace('{TOKEN_NAME_WIDTH}', tokenNameWidth.toString());

    const resvg = new Resvg(svgTemplate, { 
      fitTo: {
        mode: 'original',
      },
      font: {
        defaultFontFamily: 'Inter Display Black',
        fontFiles: [
          path.join(process.cwd(), 'assets/fonts/InterDisplay-Black.ttf'),
        ],
      },
    });

    const pngBuffer = resvg.render().asPng();

    const imageUrl = await cloudflareImageService.createImageUrl(pngBuffer);

    return imageUrl;
  } catch (error) {
    console.error("Failed to generate thumbnail", error);
    return null;
  }
}

export function measureTextWidth(text: string, font: string): number {
  const canvas = createCanvas(1400, 200);
  const context = canvas.getContext('2d');

  context.font = font;
  const metrics = context.measureText(text);
  return Math.ceil(metrics.width);
}
