'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useEffect } from 'react'

interface Field {
  id: string
  label: string
  value: string
  type: string
  tabId: string
}

interface DraggableFieldProps {
  field: Field
  onChange: (value: string) => void
}

// Client-side only wrapper for the draggable field
function DraggableFieldContent({ field, onChange }: DraggableFieldProps) {
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
        <Input 
          id={field.id} 
          value={field.value}
          onChange={(e) => onChange(e.target.value)}
          type={field.type}
        />
      </div>
    </div>
  )
}

export function DraggableField({ field, onChange }: DraggableFieldProps) {
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
          <Input 
            id={field.id} 
            value={field.value}
            onChange={(e) => onChange(e.target.value)}
            type={field.type}
          />
        </div>
      </div>
    )
  }

  return <DraggableFieldContent field={field} onChange={onChange} />
} 