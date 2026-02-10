// Save working paper and submit to Snaptable API
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const snaptableApiUrl = process.env.SNAPTABLE_API_URL
const snaptableApiToken = process.env.SNAPTABLE_API_TOKEN

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials')
}

if (!snaptableApiUrl || !snaptableApiToken) {
  throw new Error('Missing Snaptable API credentials')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

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
    const { working_paper_id, submit_to_snaptable = false } = req.body

    if (!working_paper_id) {
      return res.status(400).json({ error: 'Missing working_paper_id' })
    }

    // Get working paper
    const { data: workingPaper, error: wpError } = await supabase
      .from('working_papers')
      .select('*')
      .eq('id', working_paper_id)
      .single()

    if (wpError || !workingPaper) {
      return res.status(404).json({ error: 'Working paper not found' })
    }

    // Update status
    const updateData = {
      status: submit_to_snaptable ? 'submitted' : 'reviewed',
      updated_at: new Date().toISOString()
    }

    if (submit_to_snaptable) {
      updateData.submitted_at = new Date().toISOString()
    }

    // Convert working paper content to unstructured text for Snaptable
    let unstructuredText = ''
    if (workingPaper.content && Array.isArray(workingPaper.content)) {
      unstructuredText = workingPaper.content.map(item => {
        let text = `Question: ${item.question || 'N/A'}\n`
        text += `Answer: ${item.answer || 'N/A'}\n`
        if (item.sources && Array.isArray(item.sources)) {
          text += `Sources:\n`
          item.sources.forEach(source => {
            text += `- ${source.document_name || 'Unknown'}, Page ${source.page_number || 'N/A'}\n`
          })
        }
        return text
      }).join('\n\n')
    }

    // Submit to Snaptable if requested
    if (submit_to_snaptable && unstructuredText) {
      try {
        const snaptableResponse = await fetch(snaptableApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${snaptableApiToken}`
          },
          body: JSON.stringify({ text: unstructuredText })
        })

        if (!snaptableResponse.ok) {
          const errorText = await snaptableResponse.text()
          console.error('Snaptable API error:', errorText)
          throw new Error(`Snaptable API error: ${errorText}`)
        }

        const snaptableResult = await snaptableResponse.json()
        updateData.snaptable_submission_id = snaptableResult.id || snaptableResult.submission_id || 'unknown'
      } catch (snaptableError) {
        console.error('Error submitting to Snaptable:', snaptableError)
        // Continue with saving even if Snaptable fails
      }
    }

    // Update working paper in database
    const { data: updatedPaper, error: updateError } = await supabase
      .from('working_papers')
      .update(updateData)
      .eq('id', working_paper_id)
      .select()
      .single()

    if (updateError) {
      return res.status(500).json({ 
        error: 'Failed to update working paper',
        details: updateError.message 
      })
    }

    return res.status(200).json({
      success: true,
      working_paper: updatedPaper,
      submitted_to_snaptable: submit_to_snaptable,
      unstructured_text_length: unstructuredText.length
    })

  } catch (error) {
    console.error('Error saving working paper:', error)
    return res.status(500).json({
      error: 'Error saving working paper',
      message: error.message
    })
  }
}
