declare module 'pdf-parse' {
  export interface PDFParseResult {
    numpages: number;
    numrender: number;
    info?: Record<string, unknown>;
    metadata?: unknown;
    text: string;
    version?: string;
  }

  export interface PDFParseOptions {
    max?: number;
    version?: string;
  }

  export default function pdfParse(
    dataBuffer: Buffer | Uint8Array,
    options?: PDFParseOptions,
  ): Promise<PDFParseResult>;
}
