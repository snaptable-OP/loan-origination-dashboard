import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Plus, Trash2, Save, FileText } from 'lucide-react'

export default function ChecklistManager() {
  const [checklists, setChecklists] = useState([])
  const [editingChecklist, setEditingChecklist] = useState(null)
  const [newChecklist, setNewChecklist] = useState({
    name: '',
    description: '',
    questions: []
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadChecklists()
  }, [])

  const loadChecklists = async () => {
    try {
      const { data, error } = await supabase
        .from('checklists')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setChecklists(data || [])
    } catch (error) {
      console.error('Error loading checklists:', error)
    }
  }

  const addQuestion = () => {
    setNewChecklist({
      ...newChecklist,
      questions: [
        ...newChecklist.questions,
        {
          id: `q${Date.now()}`,
          question: '',
          category: 'General',
          required: true
        }
      ]
    })
  }

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...newChecklist.questions]
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    }
    setNewChecklist({
      ...newChecklist,
      questions: updatedQuestions
    })
  }

  const removeQuestion = (index) => {
    const updatedQuestions = newChecklist.questions.filter((_, i) => i !== index)
    setNewChecklist({
      ...newChecklist,
      questions: updatedQuestions
    })
  }

  const saveChecklist = async () => {
    if (!newChecklist.name || newChecklist.questions.length === 0) {
      alert('Please provide a name and at least one question')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('checklists')
        .insert({
          name: newChecklist.name,
          description: newChecklist.description,
          questions: newChecklist.questions,
          is_active: true
        })

      if (error) throw error

      setNewChecklist({ name: '', description: '', questions: [] })
      await loadChecklists()
      alert('Checklist saved successfully!')
    } catch (error) {
      console.error('Error saving checklist:', error)
      alert('Error saving checklist: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Checklist Management</h1>
      </div>

      {/* Create New Checklist */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Create New Checklist</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Checklist Name *
            </label>
            <input
              type="text"
              value={newChecklist.name}
              onChange={(e) => setNewChecklist({ ...newChecklist, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., Project Financing Review Checklist"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={newChecklist.description}
              onChange={(e) => setNewChecklist({ ...newChecklist, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={2}
              placeholder="Brief description of this checklist"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Questions *
              </label>
              <button
                onClick={addQuestion}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-1"
              >
                <Plus size={16} />
                Add Question
              </button>
            </div>

            <div className="space-y-3">
              {newChecklist.questions.map((q, index) => (
                <div key={q.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Enter question..."
                      />
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={q.category}
                          onChange={(e) => updateQuestion(index, 'category', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Category (e.g., Financial, Legal)"
                        />
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={q.required}
                            onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                            className="rounded"
                          />
                          Required
                        </label>
                      </div>
                    </div>
                    <button
                      onClick={() => removeQuestion(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={saveChecklist}
            disabled={loading || !newChecklist.name || newChecklist.questions.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save size={18} />
            Save Checklist
          </button>
        </div>
      </div>

      {/* Existing Checklists */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Existing Checklists</h2>
        <div className="space-y-3">
          {checklists.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No checklists created yet</p>
          ) : (
            checklists.map(checklist => (
              <div key={checklist.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{checklist.name}</h3>
                    {checklist.description && (
                      <p className="text-sm text-gray-600 mt-1">{checklist.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {checklist.questions?.length || 0} questions • Created {new Date(checklist.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    checklist.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {checklist.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
