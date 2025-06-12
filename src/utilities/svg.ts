class Svg {
    static async downloadImageAsBase64(url: string): Promise<string> {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
      
        const mimeType = response.headers.get('content-type') || 'image/png';
      
        const base64 = buffer.toString('base64');
        return `data:${mimeType};base64,${base64}`;
      }
}

export default Svg;
