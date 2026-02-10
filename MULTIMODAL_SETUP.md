# Multimodal Document Processing Setup

## Overview

The document review workflow now supports multimodal LLM processing for PDFs containing tables, images, and complex layouts using GPT-4 Vision.

## How It Works

1. **PDF Upload**: PDF is uploaded to Supabase Storage
2. **PDF to Images**: PDF pages are converted to images (client-side using pdf.js)
3. **Vision Processing**: Each page image is sent to GPT-4 Vision to extract:
   - Text content
   - Tables (converted to markdown)
   - Structured data
   - Numerical values
4. **Embedding Creation**: Extracted text is embedded using text-embedding-ada-002
5. **Vector Storage**: Embeddings stored in Supabase with metadata about tables/images

## Key Features

- **Automatic Table Detection**: Detects and extracts tables from PDFs
- **Image Understanding**: Processes images within documents
- **Structured Data Extraction**: Preserves numerical data and relationships
- **Fallback Support**: Falls back to text extraction if images unavailable

## API Endpoints

### Multimodal Processing
`POST /api/documents/process-multimodal`

**Request Body:**
```json
{
  "document_id": "uuid",
  "use_multimodal": true,
  "images": ["base64_image_1", "base64_image_2", ...],
  "text_content": "fallback text content"
}
```

**Response:**
```json
{
  "success": true,
  "chunks_created": 10,
  "processing_method": "multimodal",
  "chunks": [...]
}
```

## Frontend Component

`DocumentUploader.jsx` handles:
- PDF to image conversion (client-side)
- Upload to Supabase Storage
- Multimodal processing
- Progress tracking

## Dependencies

```bash
npm install pdfjs-dist
```

## Environment Variables

Already required:
- `OPENAI_API_KEY` - For GPT-4 Vision and embeddings

## Usage

1. User uploads PDF
2. Component converts PDF pages to images
3. Images sent to `/api/documents/process-multimodal`
4. GPT-4 Vision extracts text, tables, and data
5. Results embedded and stored for RAG queries

## RAG Query Enhancement

The RAG query endpoint (`/api/rag/query`) now:
- Uses GPT-4 (better at structured data)
- Understands table context
- Extracts precise numerical values
- References document and page numbers

## Alternative Approaches

If client-side PDF conversion is too heavy, consider:

1. **Server-side with pdf-poppler** (requires system dependencies)
2. **Adobe PDF Services API** (cloud service)
3. **Google Cloud Document AI** (specialized for tables)
4. **AWS Textract** (table extraction)

## Cost Considerations

- GPT-4 Vision: ~$0.01 per page (varies by image size)
- Text embeddings: ~$0.0001 per page
- Consider caching results to reduce costs

## Testing

1. Upload a PDF with tables
2. Check console logs for processing method
3. Verify chunks contain table data in markdown format
4. Test RAG queries on table-related questions
