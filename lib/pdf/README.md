# PDF Parsing System

Provides a unified interface for PDF parsing through local parsers.

## Supported Providers

### unpdf (Built-in)

- **Cost**: Free, built-in
- **Features**: Basic text extraction, image extraction
- **Requirements**: None
- **Usage**: Directly upload PDF files

### pdf-parse

- **Cost**: Free, local dependency
- **Features**: Text extraction, metadata
- **Requirements**: None
- **Usage**: Best for straightforward text-heavy PDFs

## Quick Start

### API Usage

#### Using unpdf (File Upload)

```typescript
const formData = new FormData();
formData.append('pdf', pdfFile);
formData.append('providerId', 'unpdf');

const response = await fetch('/api/parse-pdf', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
// result.data: ParsedPdfContent
```

#### Using pdf-parse (File Upload)

```typescript
const formData = new FormData();
formData.append('pdf', pdfFile);
formData.append('providerId', 'pdf-parse');

const response = await fetch('/api/parse-pdf', {
  method: 'POST',
  body: formData,
});
```

## Response Format

```typescript
interface ParsedPdfContent {
  text: string; // Extracted text
  images: string[]; // Base64 image array

  metadata?: {
    pageCount: number;
    parser: 'unpdf' | 'pdf-parse';
    fileName?: string;
    fileSize?: number;
    processingTime?: number;
    imageMapping?: Record<string, string>; // img_1 -> base64 URL
    pdfImages?: Array<{
      id: string; // img_1, img_2, etc.
      src: string; // base64 data URL
      pageNumber: number; // PDF page number
      description?: string; // Image description
    }>;
  };
}
```

## Integration with Content Generation

The parsers integrate with the content generation pipeline:

```typescript
// 1. Parse PDF
const parseResult = await parsePDF(
  {
    providerId: 'unpdf',
  },
  buffer,
);

// 2. Extract data
const pdfText = parseResult.text; // Markdown (with img_1 references)
const pdfImages = parseResult.metadata.pdfImages; // Image array
const imageMapping = parseResult.metadata.imageMapping; // Image mapping

// 3. Generate scene outlines
await generateSceneOutlinesFromRequirements(
  requirements,
  pdfText, // Markdown content
  pdfImages, // Images with page numbers
  aiCall,
);

// 4. Generate scenes (with images)
await buildSceneFromOutline(
  outline,
  aiCall,
  stageId,
  assignedImages, // Filtered from pdfImages
  imageMapping, // For resolving img_1 to actual URLs
);
```

## Image Processing Pipeline

The `unpdf` image flow:

1. **Extract**: PDF → unpdf → text + images
2. **Convert**: `![alt](images/img_1.png)` → `![alt](img_1)`
3. **Map**: Create `{ "img_1": "data:image/png;base64,..." }`
4. **Generate**: AI uses `img_1` references to generate slides
5. **Resolve**: `resolveImageIds()` replaces with actual URLs
6. **Render**: Slides display images

`pdf-parse` skips this image pipeline and returns text plus metadata only.

## Adding New Providers

### 1. Define Provider

`lib/pdf/constants.ts`:

```typescript
export const PDF_PROVIDERS = {
  myProvider: {
    id: 'myProvider',
    name: 'My Provider',
    requiresApiKey: true,
    features: ['text', 'images'],
  },
};
```

### 2. Implement Parser

`lib/pdf/pdf-providers.ts`:

```typescript
async function parseWithMyProvider(
  config: PDFParserConfig,
  pdfBuffer: Buffer
): Promise<ParsedPdfContent> {
  // Implement parsing logic
  return {
    text: '...',
    images: [...],
    metadata: {
      pageCount: 0,
      parser: 'myProvider',
    },
  };
}
```

### 3. Add to Route

```typescript
switch (config.providerId) {
  case 'unpdf':
    result = await parseWithUnpdf(pdfBuffer);
    break;
  case 'myProvider':
    result = await parseWithMyProvider(config, pdfBuffer);
    break;
}
```

## FAQ

### Q: Images not displaying?

**A**: Ensure:

1. `imageMapping` is correctly passed to scene-stream API
2. Image ID format is correct (img_1, img_2)
3. Base64 encoding is complete

## Performance Tips

### Result Caching

```typescript
// Consider caching parse results
const cacheKey = `pdf_${fileHash}`;
const cached = localStorage.getItem(cacheKey);
if (cached) {
  return JSON.parse(cached);
}
```

## References

- **unpdf**: https://github.com/unjs/unpdf
- **Debug Tool**: http://localhost:3000/debug/pdf-parser
