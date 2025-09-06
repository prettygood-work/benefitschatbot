import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { OPS, ImageKind } from 'pdfjs-dist';
import { PNG } from 'pngjs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const STANDARD_FONT_DATA_URL = `${path.join(
  path.dirname(require.resolve('pdfjs-dist/package.json')),
  'standard_fonts',
)}/`;

export interface ParsedPage {
  pageNumber: number;
  text: string;
  images: string[];
}

export interface ParsedPdf {
  text: string;
  pages: ParsedPage[];
  images: { page: number; data: string }[];
  metadata: { pages: number };
}

/**
 * Parse a PDF buffer extracting text, images, and basic metadata.
 */
export async function parsePdf(
  data: ArrayBuffer | Uint8Array | Buffer,
): Promise<ParsedPdf> {
  const uint8 =
    data instanceof Uint8Array
      ? data
      : data instanceof ArrayBuffer
        ? new Uint8Array(data)
        : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);

  const doc = await pdfjs.getDocument({
    data: uint8,
    standardFontDataUrl: STANDARD_FONT_DATA_URL,
  }).promise;

  const pages: ParsedPage[] = [];
  const images: { page: number; data: string }[] = [];
  let text = '';

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    text += (text ? '\n' : '') + pageText;

    const pageImages: string[] = [];
    const operatorList = await page.getOperatorList();
    for (let j = 0; j < operatorList.fnArray.length; j++) {
      const fn = operatorList.fnArray[j];
      if (fn === OPS.paintImageXObject || fn === OPS.paintInlineImageXObject) {
        const args = operatorList.argsArray[j];
        let img: any;
        if (fn === OPS.paintImageXObject) {
          img = await new Promise((resolve) => page.objs.get(args[0], resolve));
        } else {
          img = args[0];
        }

        let imgBuffer = img.data as Uint8Array;
        if (img.kind === ImageKind.RGB_24BPP) {
          const rgba = Buffer.alloc(img.width * img.height * 4);
          for (let k = 0, p = 0; k < imgBuffer.length; k += 3, p += 4) {
            rgba[p] = imgBuffer[k];
            rgba[p + 1] = imgBuffer[k + 1];
            rgba[p + 2] = imgBuffer[k + 2];
            rgba[p + 3] = 255;
          }
          imgBuffer = rgba;
        }

        const png = new PNG({ width: img.width, height: img.height });
        Buffer.from(imgBuffer).copy(png.data);
        const buffer = PNG.sync.write(png);
        const dataUrl = `data:image/png;base64,${buffer.toString('base64')}`;
        images.push({ page: i, data: dataUrl });
        pageImages.push(dataUrl);
      }
    }

    pages.push({ pageNumber: i, text: pageText, images: pageImages });
  }

  return { text, pages, images, metadata: { pages: doc.numPages } };
}

/**
 * Chunk text into smaller pieces with overlap.
 */
export function chunkText(
  text: string,
  options: { maxChunkSize: number; overlapSize: number },
): string[] {
  const { maxChunkSize, overlapSize } = options;
  const chunks: string[] = [];
  const cleanText = text
    .replace(/\n\s*\n/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim();
  const sentences = cleanText.split(/(?<=[.!?])\s+/);
  let current = '';
  let size = 0;
  for (const sentence of sentences) {
    const sSize = sentence.length;
    if (size + sSize > maxChunkSize && current) {
      chunks.push(current.trim());
      const overlap = current
        .split(' ')
        .slice(-Math.floor(overlapSize / 10))
        .join(' ');
      current = `${overlap} ${sentence}`;
      size = current.length;
    } else {
      current += (current ? ' ' : '') + sentence;
      size += sSize;
    }
  }
  if (current.trim()) {
    chunks.push(current.trim());
  }
  return chunks;
}

/**
 * Chunk a parsed PDF into sections, preserving page numbers and images.
 */
export function chunkPdf(
  parsed: ParsedPdf,
  options: { maxChunkSize: number; overlapSize: number },
): { text: string; pageNumber: number; images: string[] }[] {
  return parsed.pages.flatMap((page) => {
    const pieces = chunkText(page.text, options);
    return pieces.map((text) => ({
      text,
      pageNumber: page.pageNumber,
      images: page.images,
    }));
  });
}
