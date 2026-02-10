import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  Edit, 
  Save,
  Send,
  Plus,
  Trash2,
  Search
} from 'lucide-react'
import DocumentUploader from './DocumentUploader'

export default function DocumentReview({ projectId }) {
  const [step, setStep] = useState('checklist') // checklist, documents, review, working-paper
  const [checklists, setChecklists] = useState([])
  const [selectedChecklist, setSelectedChecklist] = useState(null)
  const [documents, setDocuments] = useState([])
  const [workingPaper, setWorkingPaper] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadChecklists()
    if (projectId) {
      loadDocuments()
      loadWorkingPaper()
    }
  }, [projectId])

  const loadChecklists = async () => {
    try {
      const { data, error } = await supabase
        .from('checklists')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setChecklists(data || [])
    } catch (error) {
      console.error('Error loading checklists:', error)
    }
  }

  const loadDocuments = async () => {
    if (!projectId) return
    try {
      // First get review_project_id
      const { data: reviewProject } = await supabase
        .from('review_projects')
        .select('id')
        .eq('project_financing_data_id', projectId)
        .single()

      if (!reviewProject) return

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('review_project_id', reviewProject.id)
        .order('uploaded_at', { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (error) {
      console.error('Error loading documents:', error)
    }
  }

  const loadWorkingPaper = async () => {
    if (!projectId) return
    try {
      const { data: reviewProject } = await supabase
        .from('review_projects')
        .select('id')
        .eq('project_financing_data_id', projectId)
        .single()

      if (!reviewProject) return

      const { data, error } = await supabase
        .from('working_papers')
        .select('*')
        .eq('review_project_id', reviewProject.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') throw error
      setWorkingPaper(data)
    } catch (error) {
      console.error('Error loading working paper:', error)
    }
  }

  const handleFileUpload = async (file) => {
    if (!projectId) return

    setLoading(true)
    try {
      // Get or create review project
      let { data: reviewProject } = await supabase
        .from('review_projects')
        .select('id')
        .eq('project_financing_data_id', projectId)
        .single()

      if (!reviewProject) {
        const { data: projectData } = await supabase
          .from('project_financing_data')
          .select('project_name')
          .eq('id', projectId)
          .single()

        const { data: newProject } = await supabase
          .from('review_projects')
          .insert({
            project_financing_data_id: projectId,
            project_name: projectData?.project_name || 'Unnamed Project'
          })
          .select()
          .single()

        reviewProject = newProject
      }

      // Convert file to base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64Data = e.target.result.split(',')[1]

        // Upload document
        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            review_project_id: reviewProject.id,
            file_name: file.name,
            file_data: base64Data,
            file_type: file.type
          })
        })

        const result = await response.json()
        if (result.success) {
          await loadDocuments()
          alert('Document uploaded successfully!')
        } else {
          alert('Error uploading document: ' + result.error)
        }
        setLoading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error uploading file')
      setLoading(false)
    }
  }

  const runChecklistReview = async () => {
    if (!selectedChecklist || documents.length === 0) {
      alert('Please select a checklist and upload documents first')
      return
    }

    setLoading(true)
    try {
      const { data: reviewProject } = await supabase
        .from('review_projects')
        .select('id')
        .eq('project_financing_data_id', projectId)
        .single()

      const answers = []

      // Process each checklist question
      for (const question of selectedChecklist.questions) {
        const response = await fetch('/api/rag/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            review_project_id: reviewProject.id,
            question: question.question,
            top_k: 5
          })
        })

        const result = await response.json()
        if (result.success) {
          answers.push({
            question_id: question.id,
            question: question.question,
            answer: result.answer,
            sources: result.sources.map(s => ({
              document_id: s.document_id,
              document_name: s.document_name,
              page_number: s.page_number,
              excerpt: s.excerpt
            }))
          })
        }
      }

      // Create or update working paper
      const workingPaperData = {
        review_project_id: reviewProject.id,
        checklist_id: selectedChecklist.id,
        title: `${selectedChecklist.name} - Review`,
        content: answers,
        status: 'draft'
      }

      if (workingPaper) {
        const { error } = await supabase
          .from('working_papers')
          .update(workingPaperData)
          .eq('id', workingPaper.id)
      } else {
        const { data, error } = await supabase
          .from('working_papers')
          .insert(workingPaperData)
          .select()
          .single()

        if (error) throw error
        setWorkingPaper(data)
      }

      await loadWorkingPaper()
      setStep('working-paper')
      alert('Checklist review completed!')
    } catch (error) {
      console.error('Error running checklist review:', error)
      alert('Error running review: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const saveWorkingPaper = async (submitToSnaptable = false) => {
    if (!workingPaper) return

    setLoading(true)
    try {
      const response = await fetch('/api/working-papers/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          working_paper_id: workingPaper.id,
          submit_to_snaptable: submitToSnaptable
        })
      })

      const result = await response.json()
      if (result.success) {
        await loadWorkingPaper()
        alert(submitToSnaptable 
          ? 'Working paper saved and submitted to Snaptable!' 
          : 'Working paper saved!')
      } else {
        alert('Error saving: ' + result.error)
      }
    } catch (error) {
      console.error('Error saving working paper:', error)
      alert('Error saving working paper')
    } finally {
      setLoading(false)
    }
  }

  const updateAnswer = (questionId, newAnswer) => {
    if (!workingPaper) return

    const updatedContent = workingPaper.content.map(item => 
      item.question_id === questionId 
        ? { ...item, answer: newAnswer }
        : item
    )

    setWorkingPaper({
      ...workingPaper,
      content: updatedContent
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Document Review</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setStep('checklist')}
            className={`px-4 py-2 rounded-lg ${step === 'checklist' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Checklist
          </button>
          <button
            onClick={() => setStep('documents')}
            className={`px-4 py-2 rounded-lg ${step === 'documents' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Documents
          </button>
          <button
            onClick={() => setStep('working-paper')}
            className={`px-4 py-2 rounded-lg ${step === 'working-paper' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            disabled={!workingPaper}
          >
            Working Paper
          </button>
        </div>
      </div>

      {step === 'checklist' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Select Checklist</h2>
          <div className="space-y-3">
            {checklists.map(checklist => (
              <div
                key={checklist.id}
                onClick={() => setSelectedChecklist(checklist)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedChecklist?.id === checklist.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold">{checklist.name}</h3>
                {checklist.description && (
                  <p className="text-sm text-gray-600 mt-1">{checklist.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {checklist.questions?.length || 0} questions
                </p>
              </div>
            ))}
          </div>
          {selectedChecklist && (
            <button
              onClick={() => setStep('documents')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Next: Upload Documents
            </button>
          )}
        </div>
      )}

      {step === 'documents' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Documents</h2>
          {(() => {
            // Get review project ID
            const reviewProjectId = documents.length > 0 
              ? documents[0].review_project_id 
              : null
            
            if (!reviewProjectId && projectId) {
              // Need to create review project first
              return <div>Loading...</div>
            }
            
            return (
              <DocumentUploader
                reviewProjectId={reviewProjectId}
                onUploadComplete={(document, processResult) => {
                  loadDocuments()
                  alert(`Document processed! ${processResult.chunks_created} chunks created using ${processResult.processing_method} method.`)
                }}
              />
            )
          })()}
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Uploaded Documents ({documents.length})</h3>
            <div className="space-y-2">
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="flex-1">{doc.file_name}</span>
                  <span className="text-sm text-gray-500">
                    {doc.page_count ? `${doc.page_count} pages` : 'Processing...'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {selectedChecklist && documents.length > 0 && (
            <button
              onClick={runChecklistReview}
              disabled={loading}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Run Checklist Review'}
            </button>
          )}
        </div>
      )}

      {step === 'working-paper' && workingPaper && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">{workingPaper.title}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => saveWorkingPaper(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                <Save className="w-4 h-4 inline mr-2" />
                Save
              </button>
              <button
                onClick={() => saveWorkingPaper(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                <Send className="w-4 h-4 inline mr-2" />
                Save & Submit to Snaptable
              </button>
            </div>
          </div>
          <div className="space-y-6">
            {workingPaper.content?.map((item, index) => (
              <div key={index} className="border-b pb-6 last:border-b-0">
                <h3 className="font-semibold mb-2">{item.question}</h3>
                <textarea
                  value={item.answer || ''}
                  onChange={(e) => updateAnswer(item.question_id, e.target.value)}
                  className="w-full p-3 border rounded-lg min-h-[100px]"
                  placeholder="Answer will be generated by AI..."
                />
                {item.sources && item.sources.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Sources:</p>
                    <div className="space-y-1">
                      {item.sources.map((source, sIdx) => (
                        <div key={sIdx} className="text-sm text-gray-600 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>{source.document_name}, Page {source.page_number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
