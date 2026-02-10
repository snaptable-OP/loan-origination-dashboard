// RAG query endpoint: search documents and answer checklist questions
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const openaiApiKey = process.env.OPENAI_API_KEY

if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
  throw new Error('Missing required credentials')
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

      // Use OpenAI to find most relevant chunks
      const chunksWithScores = await Promise.all(
        allChunks.map(async (chunk) => {
          // Simple relevance scoring (you could improve this)
          const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: 'Rate the relevance of this document chunk to the question from 0-1. Return only a number.'
              },
              {
                role: 'user',
                content: `Question: ${question}\n\nChunk: ${chunk.chunk_text.substring(0, 500)}`
              }
            ],
            temperature: 0
          })
          return {
            ...chunk,
            relevance_score: parseFloat(response.choices[0].message.content) || 0
          }
        })
      )

      chunksWithScores.sort((a, b) => b.relevance_score - a.relevance_score)
      const topChunks = chunksWithScores.slice(0, top_k)

      // Generate answer using RAG
      const context = topChunks.map(c => 
        `[Document: ${c.documents.file_name}, Page ${c.page_number}]\n${c.chunk_text}`
      ).join('\n\n')

      const answerResponse = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a document review assistant. Answer questions based on the provided document excerpts. Always cite the document name and page number in your answer.'
          },
          {
            role: 'user',
            content: `Question: ${question}\n\nContext:\n${context}\n\nAnswer the question based on the context above. Include document name and page number references.`
          }
        ],
        temperature: 0.3
      })

      const answer = answerResponse.choices[0].message.content

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

    // Generate answer
    const answerResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a document review assistant. Answer questions based on the provided document excerpts. Always cite the document name and page number in your answer.'
        },
        {
          role: 'user',
          content: `Question: ${question}\n\nContext:\n${context}\n\nAnswer the question based on the context above. Include document name and page number references.`
        }
      ],
      temperature: 0.3
    })

    const answer = answerResponse.choices[0].message.content

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
