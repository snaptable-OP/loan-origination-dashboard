import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req, res) {
  // Enable CORS
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
    const { review_project_id, file_name, file_data, file_type } = req.body

    if (!review_project_id || !file_name || !file_data) {
      return res.status(400).json({ 
        error: 'Missing required fields: review_project_id, file_name, file_data' 
      })
    }

    // Convert base64 to buffer
    const fileBuffer = Buffer.from(file_data, 'base64')
    
    // Upload to Supabase Storage
    const storagePath = `documents/${review_project_id}/${Date.now()}_${file_name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, fileBuffer, {
        contentType: file_type || 'application/pdf',
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return res.status(500).json({ 
        error: 'Failed to upload file to storage',
        details: uploadError.message 
      })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(storagePath)

    // Save document metadata to database
    const { data: documentData, error: dbError } = await supabase
      .from('documents')
      .insert([{
        review_project_id,
        file_name,
        file_path: storagePath,
        file_type: file_type || 'application/pdf',
        file_size: fileBuffer.length
      }])
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Try to clean up uploaded file
      await supabase.storage.from('documents').remove([storagePath])
      return res.status(500).json({ 
        error: 'Failed to save document metadata',
        details: dbError.message 
      })
    }

    return res.status(200).json({
      success: true,
      document: {
        ...documentData,
        url: urlData.publicUrl
      }
    })

  } catch (error) {
    console.error('Error uploading document:', error)
    return res.status(500).json({
      error: 'Error processing document upload',
      message: error.message
    })
  }
}
