// RAG query endpoint: search documents and answer checklist questions
// Uses Gemini Flash-3 for answer generation, OpenAI for embeddings
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const geminiApiKey = process.env.GEMINI_API_KEY
const openaiApiKey = process.env.OPENAI_API_KEY

if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
  throw new Error('Missing required credentials')
}

if (!geminiApiKey) {
  throw new Error('Missing Gemini API key')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const genAI = new GoogleGenerativeAI(geminiApiKey)
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
    const { review_project_id, question, top_k = 5 } = req.body

    if (!review_project_id || !question) {
      return res.status(400).json({ 
        error: 'Missing required fields: review_project_id, question' 
      })
    }

    // Create embedding for the question
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: question
    })

    const questionEmbedding = embeddingResponse.data[0].embedding

    // Get all documents for this project
    const { data: documents } = await supabase
      .from('documents')
      .select('id')
      .eq('review_project_id', review_project_id)

    if (!documents || documents.length === 0) {
      return res.status(404).json({ error: 'No documents found for this project' })
    }

    const documentIds = documents.map(d => d.id)

    // Vector similarity search
    const { data: chunks, error: searchError } = await supabase.rpc('match_document_chunks', {
      query_embedding: questionEmbedding,
      match_threshold: 0.7,
      match_count: top_k,
      document_ids: documentIds
    })

    if (searchError) {
      console.error('Vector search error:', searchError)
      // Fallback to simple text search if RPC function doesn't exist
      const { data: allChunks } = await supabase
        .from('document_chunks')
        .select('*, documents!inner(id, file_name)')
        .in('document_id', documentIds)
        .limit(top_k)

      if (!allChunks || allChunks.length === 0) {
        return res.status(404).json({ error: 'No relevant chunks found' })
      }

      // Use Gemini to find most relevant chunks
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
      const chunksWithScores = await Promise.all(
        allChunks.map(async (chunk) => {
          // Simple relevance scoring using Gemini
          const prompt = `Rate the relevance of this document chunk to the question from 0-1. Return only a number.\n\nQuestion: ${question}\n\nChunk: ${chunk.chunk_text.substring(0, 500)}`
          const result = await model.generateContent(prompt)
          const scoreText = result.response.text().trim()
          return {
            ...chunk,
            relevance_score: parseFloat(scoreText) || 0
          }
        })
      )

      chunksWithScores.sort((a, b) => b.relevance_score - a.relevance_score)
      const topChunks = chunksWithScores.slice(0, top_k)

      // Generate answer using RAG with Gemini Flash-3
      const context = topChunks.map(c => 
        `[Document: ${c.documents.file_name}, Page ${c.page_number}]\n${c.chunk_text}`
      ).join('\n\n')

      const answerModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
      const answerPrompt = `You are a document review assistant. Answer questions based on the provided document excerpts. The excerpts may contain tables, structured data, or images that were converted to text. Always cite the document name and page number in your answer. When referencing tables or numerical data, be precise and include the exact values.

Question: ${question}

Context:
${context}

Answer the question based on the context above. If the context contains tables or structured data, extract and reference the specific values. Always include document name and page number references.`

      const answerResult = await answerModel.generateContent(answerPrompt)
      const answer = answerResult.response.text()

      return res.status(200).json({
        success: true,
        answer,
        sources: topChunks.map(c => ({
          document_id: c.document_id,
          document_name: c.documents.file_name,
          page_number: c.page_number,
          excerpt: c.chunk_text.substring(0, 200) + '...',
          relevance_score: c.relevance_score
        }))
      })
    }

    // Process results from vector search
    const sources = chunks.map(c => ({
      document_id: c.document_id,
      document_name: c.file_name,
      page_number: c.page_number,
      excerpt: c.chunk_text.substring(0, 200) + '...'
    }))

    const context = chunks.map(c => 
      `[Document: ${c.file_name}, Page ${c.page_number}]\n${c.chunk_text}`
    ).join('\n\n')

    // Generate answer using Gemini Flash-3 for better table/data understanding
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
    const prompt = `You are a document review assistant. Answer questions based on the provided document excerpts. The excerpts may contain tables, structured data, or images that were converted to text. Always cite the document name and page number in your answer. When referencing tables or numerical data, be precise and include the exact values.

Question: ${question}

Context:
${context}

Answer the question based on the context above. If the context contains tables or structured data, extract and reference the specific values. Always include document name and page number references.`

    const result = await model.generateContent(prompt)
    const answer = result.response.text()

    return res.status(200).json({
      success: true,
      answer,
      sources
    })

  } catch (error) {
    console.error('Error in RAG query:', error)
    return res.status(500).json({
      error: 'Error processing RAG query',
      message: error.message
    })
  }
}
