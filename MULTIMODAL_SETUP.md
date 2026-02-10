# Multimodal Document Processing Setup

## Overview

The document review workflow now supports multimodal LLM processing for PDFs containing tables, images, and complex layouts using **Google Gemini Flash-3**.

## How It Works

1. **PDF Upload**: PDF is uploaded to Supabase Storage
2. **PDF to Images**: PDF pages are converted to images (client-side using pdf.js)
3. **Multimodal Processing**: Each page image is sent to **Gemini Flash-3** to extract:
   - Text content
   - Tables (converted to markdown)
   - Structured data
   - Numerical values
4. **Embedding Creation**: Extracted text is embedded using OpenAI text-embedding-ada-002
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
npm install @google/generative-ai pdfjs-dist
```

## Environment Variables

Required:
- `GEMINI_API_KEY` - For Gemini Flash-3 multimodal processing
- `OPENAI_API_KEY` - For text embeddings (text-embedding-ada-002)

## Usage

1. User uploads PDF
2. Component converts PDF pages to images
3. Images sent to `/api/documents/process-multimodal`
4. **Gemini Flash-3** extracts text, tables, and data
5. Results embedded and stored for RAG queries

## RAG Query Enhancement

The RAG query endpoint (`/api/rag/query`) now:
- Uses **Gemini Flash-3** for answer generation (excellent at structured data and tables)
- Uses OpenAI embeddings for vector search
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

- **Gemini Flash-3**: Much cheaper than GPT-4 Vision (~$0.0001-0.001 per page)
- Text embeddings: ~$0.0001 per page
- Consider caching results to reduce costs

**Note**: Gemini Flash-3 is significantly more cost-effective while maintaining excellent performance on tables and structured data.

## Testing

1. Upload a PDF with tables
2. Check console logs for processing method
3. Verify chunks contain table data in markdown format
4. Test RAG queries on table-related questions
