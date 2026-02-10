import { useState } from 'react'
import { Upload, FileText, Loader } from 'lucide-react'

export default function DocumentUploader({ reviewProjectId, onUploadComplete }) {
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const convertPdfToImages = async (file) => {
    // Client-side PDF to image conversion using pdf.js
    // This requires pdfjs-dist package
    const pdfjsLib = await import('pdfjs-dist')
    
    // Set worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    
    const images = []
    const textPages = []

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      
      // Render page to canvas
      const viewport = page.getViewport({ scale: 2.0 })
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.height = viewport.height
      canvas.width = viewport.width

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise

      // Convert canvas to base64 image
      const imageBase64 = canvas.toDataURL('image/png').split(',')[1]
      images.push(imageBase64)

      // Also extract text for fallback
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map(item => item.str).join(' ')
      textPages.push(pageText)

      setProgress((pageNum / pdf.numPages) * 50) // First 50% for conversion
    }

    return { images, textPages }
  }

  const handleFileUpload = async (file) => {
    if (!file || !reviewProjectId) return

    setUploading(true)
    setProgress(0)

    try {
      // Step 1: Convert PDF to base64 for upload
      const reader = new FileReader()
      const fileBase64 = await new Promise((resolve, reject) => {
        reader.onload = (e) => resolve(e.target.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      setProgress(10)

      // Step 2: Upload file to storage
      const uploadResponse = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review_project_id: reviewProjectId,
          file_name: file.name,
          file_data: fileBase64,
          file_type: file.type
        })
      })

      const uploadResult = await uploadResponse.json()
      if (!uploadResult.success) {
        throw new Error(uploadResult.error)
      }

      setProgress(30)
      setUploading(false)
      setProcessing(true)

      // Step 3: Process document (multimodal if PDF)
      if (file.type === 'application/pdf') {
        // Convert PDF to images for multimodal processing
        const { images, textPages } = await convertPdfToImages(file)
        setProgress(60)

        // Process with multimodal endpoint
        const processResponse = await fetch('/api/documents/process-multimodal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            document_id: uploadResult.document.id,
            use_multimodal: true,
            images: images,
            text_content: textPages.join('\n\n---PAGE_BREAK---\n\n')
          })
        })

        const processResult = await processResponse.json()
        if (!processResult.success) {
          throw new Error(processResult.error)
        }

        setProgress(100)
        if (onUploadComplete) {
          onUploadComplete(uploadResult.document, processResult)
        }
      } else {
        // For non-PDF files, extract text and process normally
        // You might want to add text extraction for DOCX, etc.
        const textContent = 'Text extraction for non-PDF files not yet implemented'
        
        const processResponse = await fetch('/api/documents/process-multimodal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            document_id: uploadResult.document.id,
            use_multimodal: false,
            text_content: textContent
          })
        })

        const processResult = await processResponse.json()
        setProgress(100)
        if (onUploadComplete) {
          onUploadComplete(uploadResult.document, processResult)
        }
      }
    } catch (error) {
      console.error('Error uploading/processing document:', error)
      alert('Error: ' + error.message)
    } finally {
      setUploading(false)
      setProcessing(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => {
            const file = e.target.files[0]
            if (file) handleFileUpload(file)
          }}
          className="hidden"
          id="file-upload"
          disabled={uploading || processing}
        />
        <label
          htmlFor="file-upload"
          className={`cursor-pointer px-4 py-2 rounded-lg inline-block ${
            uploading || processing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {uploading ? 'Uploading...' : processing ? 'Processing...' : 'Choose File'}
        </label>
        {(uploading || processing) && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">{Math.round(progress)}%</p>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 text-center">
        PDFs with tables/images will be processed using multimodal AI (GPT-4 Vision)
      </p>
    </div>
  )
}
