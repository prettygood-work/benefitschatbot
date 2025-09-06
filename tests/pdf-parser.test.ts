import { describe, it, expect } from 'vitest';
import { PDFDocument, rgb } from 'pdf-lib';
import { parsePdf, chunkPdf } from '@/lib/documents/pdf-parser';

async function createSamplePdf(text: string) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([400, 400]);
  page.drawText(text, { x: 50, y: 350, size: 24, color: rgb(0, 0, 0) });
  const imgBytes = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4AWP4DwQACfsD/c8LaHIAAAAASUVORK5CYII=',
    'base64',
  );
  const image = await pdfDoc.embedPng(Uint8Array.from(imgBytes));
  page.drawImage(image, { x: 50, y: 50, width: 20, height: 20 });
  return pdfDoc.save();
}

describe('pdf parser', () => {
  it('extracts text, images, and metadata', async () => {
    const pdfBytes = await createSamplePdf('Hello PDF');
    const parsed = await parsePdf(pdfBytes);
    expect(parsed.metadata.pages).toBe(1);
    expect(parsed.text).toContain('Hello PDF');
    expect(parsed.images.length).toBe(1);
    expect(parsed.pages[0].images.length).toBe(1);
  });

  it('chunks parsed data', async () => {
    const longText = Array(20).fill('Sentence.').join(' ');
    const pdfBytes = await createSamplePdf(longText);
    const parsed = await parsePdf(pdfBytes);
    const chunks = chunkPdf(parsed, { maxChunkSize: 20, overlapSize: 5 });
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].text.length).toBeLessThanOrEqual(20);
  });

  it('throws on invalid input', async () => {
    await expect(parsePdf(Buffer.from('not a pdf'))).rejects.toThrow();
  });
});
