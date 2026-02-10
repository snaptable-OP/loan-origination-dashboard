// Process uploaded document with multimodal LLM support for tables/images
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import sharp from 'sharp'

const execAsync = promisify(exec)
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
    const { document_id, use_multimodal = true } = req.body

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

    const chunks = []

    if (use_multimodal && document.file_type === 'application/pdf') {
      // Multimodal processing: Convert PDF pages to images and use GPT-4 Vision
      const tempDir = `/tmp/pdf_${document_id}`
      await execAsync(`mkdir -p ${tempDir}`)

      try {
        // Convert PDF to images using pdf-poppler or similar
        // For Vercel/serverless, you might need to use a different approach
        // Option 1: Use pdf-poppler (requires system dependencies)
        // Option 2: Use a service like Adobe PDF Services
        // Option 3: Convert client-side and send images

        // For now, we'll use a hybrid approach:
        // If images are provided, use them; otherwise fall back to text extraction
        
        const { images, text_content } = req.body

        if (images && Array.isArray(images)) {
          // Process each page image with GPT-4 Vision
          for (let i = 0; i < images.length; i++) {
            const imageBase64 = images[i]
            const pageNumber = i + 1

            // Use GPT-4 Vision to extract text and understand tables/images
            const visionResponse = await openai.chat.completions.create({
              model: 'gpt-4-vision-preview',
              messages: [
                {
                  role: 'user',
                  content: [
                    {
                      type: 'text',
                      text: 'Extract all text, tables, and structured data from this document page. Format tables as markdown. Include all numerical data, labels, and context. Be thorough and accurate.'
                    },
                    {
                      type: 'image_url',
                      image_url: {
                        url: `data:image/png;base64,${imageBase64}`
                      }
                    }
                  ]
                }
              ],
              max_tokens: 4096
            })

            const extractedText = visionResponse.choices[0].message.content

            // Create embedding from extracted text
            const embeddingResponse = await openai.embeddings.create({
              model: 'text-embedding-ada-002',
              input: extractedText
            })

            const embedding = embeddingResponse.data[0].embedding

            // Save chunk
            const { error: chunkError } = await supabase
              .from('document_chunks')
              .insert({
                document_id,
                chunk_text: extractedText,
                chunk_index: i,
                page_number: pageNumber,
                embedding: embedding,
                metadata: {
                  processing_method: 'multimodal_vision',
                  has_tables: extractedText.includes('|') || extractedText.includes('Table'),
                  has_images: true
                }
              })

            if (chunkError) {
              console.error('Error saving chunk:', chunkError)
            } else {
              chunks.push({ page: pageNumber, length: extractedText.length })
            }
          }
        } else if (text_content) {
          // Fallback to text-based processing if images not provided
          const pages = text_content.split('\n\n---PAGE_BREAK---\n\n')
          
          for (let i = 0; i < pages.length; i++) {
            const pageText = pages[i].trim()
            if (!pageText) continue

            // Check if page might contain tables (simple heuristic)
            const mightHaveTables = pageText.includes('|') || 
                                   pageText.match(/\d+[\s]+\d+[\s]+\d+/g) // Multiple numbers in rows

            // If tables detected, use GPT-4 to better structure the data
            let processedText = pageText
            if (mightHaveTables) {
              const structureResponse = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                  {
                    role: 'system',
                    content: 'Extract and structure all tables and data from this text. Convert tables to markdown format. Preserve all numerical values and labels.'
                  },
                  {
                    role: 'user',
                    content: pageText
                  }
                ],
                temperature: 0
              })
              processedText = structureResponse.choices[0].message.content
            }

            const embeddingResponse = await openai.embeddings.create({
              model: 'text-embedding-ada-002',
              input: processedText
            })

            const embedding = embeddingResponse.data[0].embedding

            const { error: chunkError } = await supabase
              .from('document_chunks')
              .insert({
                document_id,
                chunk_text: processedText,
                chunk_index: i,
                page_number: i + 1,
                embedding: embedding,
                metadata: {
                  processing_method: 'text_with_table_detection',
                  has_tables: mightHaveTables
                }
              })

            if (chunkError) {
              console.error('Error saving chunk:', chunkError)
            } else {
              chunks.push({ page: i + 1, length: processedText.length })
            }
          }
        } else {
          return res.status(400).json({ 
            error: 'For multimodal processing, provide either images array or text_content' 
          })
        }
      } finally {
        // Cleanup temp directory
        await execAsync(`rm -rf ${tempDir}`).catch(() => {})
      }
    } else {
      // Standard text-only processing
      const { text_content } = req.body
      if (!text_content) {
        return res.status(400).json({ error: 'Text content required' })
      }

      const pages = text_content.split('\n\n---PAGE_BREAK---\n\n')
      
      for (let i = 0; i < pages.length; i++) {
        const pageText = pages[i].trim()
        if (!pageText) continue

        const embeddingResponse = await openai.embeddings.create({
          model: 'text-embedding-ada-002',
          input: pageText
        })

        const embedding = embeddingResponse.data[0].embedding

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
    }

    // Update document with page count
    await supabase
      .from('documents')
      .update({ page_count: chunks.length })
      .eq('id', document_id)

    return res.status(200).json({
      success: true,
      chunks_created: chunks.length,
      chunks: chunks,
      processing_method: use_multimodal ? 'multimodal' : 'text_only'
    })

  } catch (error) {
    console.error('Error processing document:', error)
    return res.status(500).json({
      error: 'Error processing document',
      message: error.message
    })
  }
}
