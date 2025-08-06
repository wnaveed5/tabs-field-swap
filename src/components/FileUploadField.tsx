'use client'

import { useState, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Upload, X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useFieldStore } from "@/lib/store"

interface FileUploadFieldProps {
  field: {
    id: string
    label: string
    value: string
    type: string
    tabId: string
  }
  onChange: (value: string) => void
}

// Client-side only wrapper for the file upload field
function FileUploadFieldContent({ field, onChange }: FileUploadFieldProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{
    tabHeaders: string[]
    analysis: string
  } | null>(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleFileSelect = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      onChange(file.name)
      
      // Automatically analyze the image
      await analyzeImage(file)
    }
  }

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true)
    setAnalysisResult(null)
    
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      console.log('Sending image to API...', file.name, file.size)
      
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData,
      })
      
      console.log('API response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('API result:', result)
        setAnalysisResult(result)
        
        // Create tabs from the detected headers
        if (result.tabHeaders && result.tabHeaders.length > 0) {
          console.log('Creating tabs from headers:', result.tabHeaders)
          const { createTabsFromHeaders } = useFieldStore.getState()
          createTabsFromHeaders(result.tabHeaders)
        }
      } else {
        const errorText = await response.text()
        console.error('Failed to analyze image:', response.status, errorText)
        setAnalysisResult({
          tabHeaders: [],
          analysis: `Error: ${response.status} - ${errorText}`
        })
      }
    } catch (error) {
      console.error('Error analyzing image:', error)
      setAnalysisResult({
        tabHeaders: [],
        analysis: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    onChange('')
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
  }

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="flex items-center gap-3 p-3 border rounded-lg bg-background hover:bg-accent/50 transition-colors"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 grid gap-3">
        <Label htmlFor={field.id}>{field.label}</Label>
        
        {selectedFile ? (
          <div className="space-y-3">
            <div className="relative">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-32 h-32 object-cover rounded border"
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                onClick={removeFile}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
            
            {/* Analysis Results */}
            {isAnalyzing && (
              <div className="p-3 bg-blue-50 rounded border">
                <p className="text-sm text-blue-600">Analyzing image with GPT...</p>
              </div>
            )}
            
            {analysisResult && !isAnalyzing && (
              <div className={`p-3 rounded border ${
                analysisResult.tabHeaders.length > 0 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <h4 className={`text-sm font-medium mb-2 ${
                  analysisResult.tabHeaders.length > 0 
                    ? 'text-green-800' 
                    : 'text-red-800'
                }`}>
                  {analysisResult.tabHeaders.length > 0 ? 'GPT Analysis Results:' : 'Analysis Error:'}
                </h4>
                {analysisResult.tabHeaders.length > 0 ? (
                  <div>
                    <p className="text-sm text-green-700 mb-2">Tab headers found in dark blue backgrounds:</p>
                    <ul className="text-sm text-green-700">
                      {analysisResult.tabHeaders.map((header, index) => (
                        <li key={index} className="ml-4">• {header}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-red-700">{analysisResult.analysis}</p>
                )}
                <details className="mt-2">
                  <summary className={`text-xs cursor-pointer ${
                    analysisResult.tabHeaders.length > 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    View full analysis
                  </summary>
                  <pre className="text-xs mt-2 p-2 bg-white rounded border overflow-auto max-h-32">
                    {analysisResult.analysis}
                  </pre>
                </details>
              </div>
            )}
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop an image here, or click to select
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById(`file-${field.id}`)?.click()}
            >
              Choose File
            </Button>
            <input
              id={`file-${field.id}`}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export function FileUploadField({ field, onChange }: FileUploadFieldProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    // Render a static version during SSR
    return (
      <div className="flex items-center gap-3 p-3 border rounded-lg bg-background">
        <div className="cursor-grab p-1">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 grid gap-3">
          <Label htmlFor={field.id}>{field.label}</Label>
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Image upload will be available after loading</p>
          </div>
        </div>
      </div>
    )
  }

  return <FileUploadFieldContent field={field} onChange={onChange} />
} 