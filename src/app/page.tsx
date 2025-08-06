'use client'

import { DndContext, DragEndEvent, DragOverEvent, MouseSensor, TouchSensor, useSensor, useSensors, DragOverlay, useDroppable, pointerWithin } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useFieldStore } from "@/lib/store"
import { DraggableField } from "@/components/DraggableField"
import { FileUploadField } from "@/components/FileUploadField"
import { useState, useRef, useEffect } from 'react'
import { GripVertical } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Client-side only wrapper component
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-6">
        {/* Separate Tab Buttons */}
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg border bg-background">
            Account
          </button>
          <button className="px-4 py-2 rounded-lg border bg-primary text-primary-foreground shadow-md">
            Settings
          </button>
        </div>
        {/* Render static content during SSR */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
              <CardDescription>Please wait while the interface loads.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Client-side only droppable tab trigger
function DroppableTabTrigger({ 
  value, 
  children, 
  isDragOver, 
  isTargetTab,
  onClick
}: { 
  value: string, 
  children: React.ReactNode, 
  isDragOver: boolean,
  isTargetTab: boolean,
  onClick: () => void
}) {
  const [hasMounted, setHasMounted] = useState(false)

  // Always call hooks in the same order
  const { setNodeRef } = useDroppable({
    id: value,
  })

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return (
      <button
        onClick={onClick}
        className={`px-6 py-3 rounded-lg transition-all duration-200 border min-w-[120px] ${
          isTargetTab 
            ? 'bg-primary text-primary-foreground shadow-md' 
            : 'bg-background hover:bg-accent/50 border-border'
        }`}
      >
        {children}
      </button>
    )
  }

  return (
    <button
      ref={setNodeRef}
      onClick={onClick}
      className={`px-6 py-3 rounded-lg transition-all duration-200 border min-w-[120px] ${
        isDragOver 
          ? 'bg-accent ring-2 ring-primary scale-105 shadow-lg' 
          : isTargetTab 
            ? 'bg-primary text-primary-foreground shadow-md' 
            : 'bg-background hover:bg-accent/50 border-border'
      }`}
    >
      {children}
    </button>
  )
}

function DragOverlayField({ field }: { field: { id: string; label: string; value: string; type: string; tabId: string } }) {
  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg bg-background shadow-lg opacity-90 scale-105">
      <div className="cursor-grabbing p-1">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 grid gap-3">
        <Label htmlFor={field.id}>{field.label}</Label>
        <Input 
          id={field.id} 
          value={field.value}
          readOnly
          type={field.type}
        />
      </div>
    </div>
  )
}

// Client-side only TabsDemo component
function TabsDemo() {
  const { tabs, setFieldValue, reorderFields, moveField, saveData } = useFieldStore()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [dragOverTab, setDragOverTab] = useState<string | null>(null)
  const [currentTab, setCurrentTab] = useState('account')
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [hasMounted, setHasMounted] = useState(false)
  const [dragHistory, setDragHistory] = useState<Array<{
    id: string
    action: 'drag_start' | 'drag_over' | 'drag_end'
    fieldId?: string
    fromTab?: string
    toTab?: string
    timestamp: number
    details: any
  }>>([])
  const [updateHighlights, setUpdateHighlights] = useState({
    uiState: false,
    interactions: false,
    tabData: false
  })

  // Always call hooks in the same order
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  )

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const logDragAction = (action: 'drag_start' | 'drag_over' | 'drag_end', details: Record<string, unknown>) => {
    const dragAction = {
      id: Math.random().toString(36).substr(2, 9),
      action,
      fieldId: activeId || undefined,
      fromTab: tabs.find(tab => tab.fields.some(field => field.id === activeId))?.id,
      toTab: currentTab,
      timestamp: Date.now(),
      details
    }
    
    setDragHistory(prev => [...prev, dragAction])
    console.log('Drag Action:', dragAction)
    
    // Highlight the interactions section
    setUpdateHighlights(prev => ({ ...prev, interactions: true }))
    setTimeout(() => setUpdateHighlights(prev => ({ ...prev, interactions: false })), 500)
  }

  const highlightUIState = () => {
    setUpdateHighlights(prev => ({ ...prev, uiState: true }))
    setTimeout(() => setUpdateHighlights(prev => ({ ...prev, uiState: false })), 500)
  }

  const highlightTabData = () => {
    setUpdateHighlights(prev => ({ ...prev, tabData: true }))
    setTimeout(() => setUpdateHighlights(prev => ({ ...prev, tabData: false })), 500)
  }

  const handleDragStart = (event: DragEndEvent) => {
    if (!hasMounted) return
    setActiveId(event.active.id as string)
    logDragAction('drag_start', {
      activeId: event.active.id,
      activeData: event.active.data
    })
  }

  const handleDragOver = (event: DragOverEvent) => {
    if (!hasMounted) return
    const { active, over } = event
    
    console.log('Drag over:', { active: active.id, over: over?.id, dragOverTab })
    
    if (!over) {
      setDragOverTab(null)
      return
    }

    // Check if dragging over a tab trigger
    if (over.id === 'account' || over.id === 'settings' || over.id === 'upload' || tabs.some(tab => tab.id === over.id)) {
      console.log('Dragging over tab:', over.id)
      setDragOverTab(over.id as string)
      
      // Immediately switch to the tab being hovered over
      if (over.id !== currentTab) {
        setCurrentTab(over.id as string)
      }
      
      logDragAction('drag_over', {
        activeId: active.id,
        overId: over.id,
        overType: 'tab_button'
      })
    } else {
      setDragOverTab(null)
      logDragAction('drag_over', {
        activeId: active.id,
        overId: over.id,
        overType: 'field'
      })
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    if (!hasMounted) return
    const { active, over } = event
    
    setActiveId(null)
    setDragOverTab(null)
    
    // Clear any pending tab switch
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
    }
    
    const activeId = active.id as string
    
    // Find which tab the active field belongs to
    const activeTab = tabs.find(tab => tab.fields.some(field => field.id === activeId))
    
    if (!activeTab) return
    
    // If no drop target or dropped on tab buttons, add to current tab
    if (!over || over.id === 'account' || over.id === 'settings' || over.id === 'upload' || tabs.some(tab => tab.id === over.id)) {
      // Add to the current tab's list
      const currentTabData = tabs.find(tab => tab.id === currentTab)
      if (currentTabData && activeTab.id !== currentTab) {
        // Move the field to the current tab
        moveField(activeId, activeTab.id, currentTab, currentTabData.fields.length)
      }
      
      logDragAction('drag_end', {
        activeId: active.id,
        result: 'snap_to_list',
        targetTab: currentTab,
        fromTab: activeTab.id
      })
      return
    }
    
    const overId = over.id as string
    const overTab = tabs.find(tab => tab.fields.some(field => field.id === overId))
    
    if (!overTab) return
    
    // If dragging within the same tab
    if (activeTab.id === overTab.id) {
      const oldIndex = activeTab.fields.findIndex(field => field.id === activeId)
      const newIndex = activeTab.fields.findIndex(field => field.id === overId)
      
      if (oldIndex !== newIndex) {
        reorderFields(activeTab.id, oldIndex, newIndex)
        logDragAction('drag_end', {
          activeId: active.id,
          overId: over.id,
          result: 'reorder',
          tab: activeTab.id,
          fromIndex: oldIndex,
          toIndex: newIndex
        })
      }
    } else {
      // If dragging between different tabs
      const oldIndex = activeTab.fields.findIndex(field => field.id === activeId)
      const newIndex = overTab.fields.findIndex(field => field.id === overId)
      
      moveField(activeId, activeTab.id, overTab.id, newIndex)
      logDragAction('drag_end', {
        activeId: active.id,
        overId: over.id,
        result: 'move_between_tabs',
        fromTab: activeTab.id,
        toTab: overTab.id,
        fromIndex: oldIndex,
        toIndex: newIndex
      })
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current)
      }
    }
  }, [])

  // Export drag history as JSON
  const exportDragHistory = () => {
    const historyJSON = JSON.stringify(dragHistory, null, 2)
    console.log('Drag History JSON:', historyJSON)
    return historyJSON
  }

  // Generate complete UI state as JSON
  const generateUIState = () => {
    const uiState = {
      ui: {
        currentTab,
        dragState: {
          isDragging: !!activeId,
          activeId,
          dragOverTab
        },
        layout: {
          tabButtons: [
            { id: 'account', isActive: currentTab === 'account', position: { x: 0, y: 0 } },
            { id: 'settings', isActive: currentTab === 'settings', position: { x: 200, y: 0 } },
            { id: 'upload', isActive: currentTab === 'upload', position: { x: 400, y: 0 } }
          ]
        }
      },
      tabs: tabs.map(tab => ({
        id: tab.id,
        name: tab.name,
        isActive: tab.id === currentTab,
        fields: tab.fields.map((field, index) => ({
          id: field.id,
          label: field.label,
          value: field.value,
          type: field.type,
          order: index
        }))
      })),
      interactions: dragHistory,
      metadata: {
        lastUpdated: Date.now(),
        totalInteractions: dragHistory.length,
        sessionDuration: dragHistory.length > 0 ? Date.now() - dragHistory[0].timestamp : 0
      }
    }
    return uiState
  }

  // Log drag history whenever it changes
  useEffect(() => {
    if (dragHistory.length > 0) {
      console.log('Current Drag History:', dragHistory)
      exportDragHistory()
    }
  }, [dragHistory])

  // Highlight UI State when currentTab or activeId changes
  useEffect(() => {
    if (hasMounted) {
      highlightUIState()
    }
  }, [currentTab, activeId, dragOverTab])

  // Highlight Tab Data when tabs change
  useEffect(() => {
    if (hasMounted) {
      highlightTabData()
    }
  }, [tabs])

  // Get all field IDs for the single SortableContext (unused but kept for future use)
  // const allFieldIds = tabs.flatMap(tab => tab.fields.map(field => field.id))
  
  // Find the active field for the drag overlay
  const activeField = tabs.flatMap(tab => tab.fields).find(field => field.id === activeId)

  if (!hasMounted) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-6">
        {/* Separate Tab Buttons */}
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg border bg-background">
            Account
          </button>
          <button className="px-4 py-2 rounded-lg border bg-primary text-primary-foreground shadow-md">
            Settings
          </button>
        </div>
        {/* Render static content during SSR */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
              <CardDescription>Please wait while the interface loads.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-6xl flex-col gap-6">
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Separate Tab Buttons */}
        <div className="flex gap-8 relative z-10 mb-4 flex-wrap">
          {tabs.map((tab) => (
            <DroppableTabTrigger 
              key={tab.id}
              value={tab.id}
              isDragOver={dragOverTab === tab.id}
              isTargetTab={currentTab === tab.id}
              onClick={() => setCurrentTab(tab.id)}
            >
              {tab.name}
            </DroppableTabTrigger>
          ))}
        </div>
        
        {/* Tab Content - All SortableContexts always available */}
        <div className="relative">
          {tabs.map((tab) => (
            <div key={tab.id} className={currentTab === tab.id ? 'block' : 'absolute -left-full opacity-0'}>
              <SortableContext
                items={tab.fields.map(field => field.id)}
                strategy={verticalListSortingStrategy}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>{tab.name}</CardTitle>
                    <CardDescription>
                      {tab.id === 'account' 
                        ? "Make changes to your account here. Click save when you're done."
                        : "Manage your application settings and preferences here."
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    <div className="space-y-3">
                      {tab.fields.map((field) => (
                        field.type === 'file' ? (
                          <FileUploadField
                            key={field.id}
                            field={field}
                            onChange={(value) => setFieldValue(field.id, value)}
                          />
                        ) : (
                          <DraggableField
                            key={field.id}
                            field={field}
                            onChange={(value) => setFieldValue(field.id, value)}
                          />
                        )
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={saveData}>Save {tab.name.toLowerCase()}</Button>
                  </CardFooter>
                </Card>
              </SortableContext>
            </div>
          ))}
        </div>
        
        <DragOverlay>
          {activeField ? <DragOverlayField field={activeField} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Debug Panel */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Complete UI State */}
        <Card className={`transition-all duration-300 ${updateHighlights.uiState ? 'ring-2 ring-green-500 bg-green-50' : ''}`}>
          <CardHeader>
            <CardTitle>Complete UI State</CardTitle>
            <CardDescription>Current interface state as JSON</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(generateUIState(), null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* User Interactions */}
        <Card className={`transition-all duration-300 ${updateHighlights.interactions ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
          <CardHeader>
            <CardTitle>User Interactions</CardTitle>
            <CardDescription>Drag and drop history</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(dragHistory, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Tab Data */}
        <Card className={`transition-all duration-300 ${updateHighlights.tabData ? 'ring-2 ring-purple-500 bg-purple-50' : ''}`}>
          <CardHeader>
            <CardTitle>Tab Data</CardTitle>
            <CardDescription>Current tab structure</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(tabs.map(tab => ({
                id: tab.id,
                name: tab.name,
                isActive: tab.id === currentTab,
                fields: tab.fields.map((field, index) => ({
                  id: field.id,
                  label: field.label,
                  value: field.value,
                  type: field.type,
                  order: index
                }))
              })), null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <ClientOnly>
        <TabsDemo />
      </ClientOnly>
    </main>
  )
}
