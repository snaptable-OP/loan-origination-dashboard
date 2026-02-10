// Process uploaded document: extract text, chunk it, and create embeddings
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const openaiApiKey = process.env.OPENAI_API_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials')
}

if (!openaiApiKey) {
  throw new Error('Missing OpenAI API key')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const openai = new OpenAI({ apiKey: openaiApiKey })

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { document_id } = req.body

    if (!document_id) {
      return res.status(400).json({ error: 'Missing document_id' })
    }

    // Get document info
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', document_id)
      .single()

    if (docError || !document) {
      return res.status(404).json({ error: 'Document not found' })
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(document.file_path)

    if (downloadError) {
      return res.status(500).json({ error: 'Failed to download file' })
    }

    // Extract text from PDF (simplified - you may want to use a proper PDF parser)
    // For now, we'll assume text extraction happens client-side or via another service
    // This is a placeholder that expects text to be provided
    const { text_content, page_count } = req.body

    if (!text_content) {
      return res.status(400).json({ 
        error: 'Text content required. Please extract text from document first.' 
      })
    }

    // Chunk the text (simple chunking by pages)
    const chunks = []
    const pages = text_content.split('\n\n---PAGE_BREAK---\n\n') // Assuming this format
    
    for (let i = 0; i < pages.length; i++) {
      const pageText = pages[i].trim()
      if (!pageText) continue

      // Create embedding
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: pageText
      })

      const embedding = embeddingResponse.data[0].embedding

      // Save chunk to database
      const { error: chunkError } = await supabase
        .from('document_chunks')
        .insert({
          document_id,
          chunk_text: pageText,
          chunk_index: i,
          page_number: i + 1,
          embedding: embedding
        })

      if (chunkError) {
        console.error('Error saving chunk:', chunkError)
      } else {
        chunks.push({ page: i + 1, length: pageText.length })
      }
    }

    // Update document with page count
    await supabase
      .from('documents')
      .update({ page_count: pages.length })
      .eq('id', document_id)

    return res.status(200).json({
      success: true,
      chunks_created: chunks.length,
      chunks: chunks
    })

  } catch (error) {
    console.error('Error processing document:', error)
    return res.status(500).json({
      error: 'Error processing document',
      message: error.message
    })
  }
}
