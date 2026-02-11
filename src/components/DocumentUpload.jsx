import { useState } from 'react'
import { Upload, FileText, CheckCircle, Loader, AlertCircle } from 'lucide-react'

export default function DocumentUpload({ projectId, onUploadComplete }) {
  const [uploading, setUploading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [progress, setProgress] = useState(0)

  const handleFileUpload = async (file) => {
    if (!file || !projectId) return

    setUploading(true)
    setProgress(0)

    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(uploadInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      // Simulate file upload (frontend only - no actual upload)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      clearInterval(uploadInterval)
      setProgress(100)
      setUploading(false)
      setParsing(true)

      // Simulate parsing process
      const parsingSteps = [
        'Extracting text from document...',
        'Identifying tables and structured data...',
        'Processing images and charts...',
        'Creating document chunks...',
        'Generating embeddings...',
        'Finalizing...'
      ]

      for (let i = 0; i < parsingSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        setProgress(100)
      }

      const newFile = {
        id: `file_${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        status: 'completed',
        pageCount: Math.floor(Math.random() * 50) + 10 // Mock page count
      }

      setUploadedFiles(prev => [...prev, newFile])
      setParsing(false)
      setProgress(0)

      if (onUploadComplete) {
        onUploadComplete(newFile)
      }

      alert('Document uploaded and parsed successfully!')
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error uploading file')
      setUploading(false)
      setParsing(false)
      setProgress(0)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'uploading':
        return <Loader className="w-5 h-5 text-blue-600 animate-spin" />
      case 'parsing':
        return <Loader className="w-5 h-5 text-yellow-600 animate-spin" />
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <FileText className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...'
      case 'parsing':
        return 'Parsing document...'
      case 'completed':
        return 'Completed'
      case 'error':
        return 'Error'
      default:
        return 'Pending'
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Documents</h2>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <input
            type="file"
            accept=".pdf,.docx,.doc"
            onChange={(e) => {
              const file = e.target.files[0]
              if (file) handleFileUpload(file)
            }}
            className="hidden"
            id="file-upload"
            disabled={uploading || parsing}
          />
          <label
            htmlFor="file-upload"
            className={`cursor-pointer px-6 py-3 rounded-lg inline-block ${
              uploading || parsing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {uploading ? 'Uploading...' : parsing ? 'Parsing...' : 'Choose File to Upload'}
          </label>
          {(uploading || parsing) && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {parsing ? 'Processing document with AI...' : `Uploading... ${Math.round(progress)}%`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Uploaded Documents</h3>
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                {getStatusIcon(file.status)}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {file.pageCount} pages • {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    file.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : file.status === 'parsing'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {getStatusText(file.status)}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(file.uploadedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
