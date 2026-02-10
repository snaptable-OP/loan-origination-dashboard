# Document Review Workflow Setup Guide

## Overview

This workflow enables:
1. Storing standardized checklists
2. Uploading project-specific documents
3. Running checklist questions against documents using RAG/vector search
4. Generating working papers with answers and source references
5. Editing and submitting working papers to Snaptable API

## Database Setup

### Step 1: Run SQL Schema

1. Go to Supabase Dashboard → SQL Editor
2. Run `supabase/document_review_schema.sql`
3. Run `supabase/rag_functions.sql`

### Step 2: Enable Supabase Storage

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `documents`
3. Set it to **Public** (or configure RLS policies)
4. Enable file size limits as needed

### Step 3: Enable pgvector Extension

The schema includes `CREATE EXTENSION IF NOT EXISTS vector;` which should run automatically, but verify:
- Go to Supabase Dashboard → Database → Extensions
- Ensure `vector` extension is enabled

## Environment Variables

Add these to your Vercel environment variables:

```
GEMINI_API_KEY=your_google_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here  # Still needed for embeddings (text-embedding-ada-002)
```

(Other variables like SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SNAPTABLE_API_URL, SNAPTABLE_API_TOKEN should already be set)

**Note**: We use Gemini Flash-3 for multimodal processing and answer generation, but OpenAI embeddings for vector search (as Gemini embeddings are not yet available).

## Install Dependencies

```bash
npm install openai
```

## API Endpoints

### 1. Upload Document
`POST /api/documents/upload`
- Body: `{ review_project_id, file_name, file_data (base64), file_type }`
- Returns: Document metadata with storage URL

### 2. Process Document
`POST /api/documents/process`
- Body: `{ document_id, text_content, page_count }`
- Extracts text, chunks it, creates embeddings
- Note: You'll need to extract PDF text client-side or use a service

### 3. RAG Query
`POST /api/rag/query`
- Body: `{ review_project_id, question, top_k }`
- Returns: `{ answer, sources: [{ document_name, page_number, excerpt }] }`

### 4. Save Working Paper
`POST /api/working-papers/save`
- Body: `{ working_paper_id, submit_to_snaptable }`
- Saves working paper and optionally submits to Snaptable

## Frontend Integration

The `DocumentReview` component is ready to use. To integrate:

1. Add to your routing in `App.jsx`:
```jsx
import DocumentReview from './components/DocumentReview'

// In renderContent():
case 'document-review':
  return <DocumentReview projectId={selectedProjectId} />
```

2. Add a button in ProjectDashboard to navigate to document review

## Workflow Steps

1. **Select Checklist**: Choose from standardized checklists
2. **Upload Documents**: Upload PDF/DOCX files for the project
3. **Process Documents**: Extract text and create embeddings (automatic or manual)
4. **Run Review**: AI answers checklist questions using RAG
5. **Edit Working Paper**: Review answers, check sources, make edits
6. **Save & Submit**: Save working paper and send to Snaptable API

## PDF Text Extraction

For production, you'll want to use a proper PDF extraction service:

**Option 1: Client-side (pdf.js)**
```bash
npm install pdfjs-dist
```

**Option 2: Server-side (pdf-parse)**
```bash
npm install pdf-parse
```

**Option 3: Use a service like:**
- Adobe PDF Services API
- Google Cloud Document AI
- AWS Textract

## Next Steps

1. Create a sample checklist in Supabase
2. Test document upload
3. Implement PDF text extraction
4. Test RAG queries
5. Test Snaptable submission

## Checklist Format

Checklists are stored as JSONB with this structure:
```json
{
  "questions": [
    {
      "id": "q1",
      "question": "What is the project's total budget?",
      "category": "Financial",
      "required": true
    }
  ]
}
```
