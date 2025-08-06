import { create } from 'zustand'

interface Field {
  id: string
  label: string
  value: string
  type: string
  tabId: string
}

interface Tab {
  id: string
  name: string
  fields: Field[]
}

interface FieldStore {
  tabs: Tab[]
  moveField: (fieldId: string, fromTabId: string, toTabId: string, newIndex: number) => void
  setFieldValue: (fieldId: string, value: string) => void
  reorderFields: (tabId: string, oldIndex: number, newIndex: number) => void
  createTabsFromHeaders: (headers: string[]) => void
  saveData: () => void
}

export const useFieldStore = create<FieldStore>((set) => ({
  tabs: [
    {
      id: 'account',
      name: 'Account',
      fields: [
        { id: 'name', label: 'Name', value: 'Pedro Duarte', type: 'text', tabId: 'account' },
        { id: 'username', label: 'Username', value: '@peduarte', type: 'text', tabId: 'account' }
      ]
    },
    {
      id: 'settings',
      name: 'Settings',
      fields: [
        { id: 'theme', label: 'Theme', value: 'Light', type: 'text', tabId: 'settings' },
        { id: 'language', label: 'Language', value: 'English', type: 'text', tabId: 'settings' },
        { id: 'timezone', label: 'Timezone', value: 'UTC', type: 'text', tabId: 'settings' }
      ]
    },
    {
      id: 'upload',
      name: 'Upload',
      fields: [
        { id: 'profile-image', label: 'Profile Image', value: '', type: 'file', tabId: 'upload' }
      ]
    }
  ],
  setFieldValue: (fieldId, value) => set((state) => ({
    tabs: state.tabs.map(tab => ({
      ...tab,
      fields: tab.fields.map(field => 
        field.id === fieldId ? { ...field, value } : field
      )
    }))
  })),
  moveField: (fieldId, fromTabId, toTabId, newIndex) => set((state) => {
    const fromTab = state.tabs.find(tab => tab.id === fromTabId)
    const toTab = state.tabs.find(tab => tab.id === toTabId)
    
    if (!fromTab || !toTab) return state
    
    const field = fromTab.fields.find(f => f.id === fieldId)
    if (!field) return state
    
    const updatedField = { ...field, tabId: toTabId }
    
    const newTabs = state.tabs.map(tab => {
      if (tab.id === fromTabId) {
        return {
          ...tab,
          fields: tab.fields.filter(f => f.id !== fieldId)
        }
      }
      if (tab.id === toTabId) {
        const newFields = [...tab.fields]
        newFields.splice(newIndex, 0, updatedField)
        return {
          ...tab,
          fields: newFields
        }
      }
      return tab
    })
    
    return { tabs: newTabs }
  }),
  reorderFields: (tabId, oldIndex, newIndex) => set((state) => {
    const tab = state.tabs.find(t => t.id === tabId)
    if (!tab) return state
    
    const newFields = [...tab.fields]
    const [movedField] = newFields.splice(oldIndex, 1)
    newFields.splice(newIndex, 0, movedField)
    
    return {
      tabs: state.tabs.map(t => 
        t.id === tabId ? { ...t, fields: newFields } : t
      )
    }
  }),
  createTabsFromHeaders: (headers: string[]) => set((state) => {
    // Generate random field names for each tab
    const randomFieldNames = [
      'Primary Identifier', 'Status Code', 'Reference Number',
      'Creation Date', 'Last Modified', 'Priority Level',
      'Category Type', 'Department Code', 'Location ID',
      'Contact Person', 'Phone Number', 'Email Address',
      'Budget Amount', 'Cost Center', 'Approval Status',
      'Document Type', 'File Path', 'Version Number',
      'User Access', 'Permission Level', 'Security Group',
      'System Log', 'Error Code', 'Debug Info'
    ]

    const newTabs: Tab[] = headers.map((header, tabIndex) => {
      // Get 3 random field names for this tab
      const startIndex = (tabIndex * 3) % randomFieldNames.length
      const tabFields = [
        randomFieldNames[startIndex],
        randomFieldNames[(startIndex + 1) % randomFieldNames.length],
        randomFieldNames[(startIndex + 2) % randomFieldNames.length]
      ]

      return {
        id: header.toLowerCase().replace(/\s+/g, '-'),
        name: header,
        fields: tabFields.map((fieldName, fieldIndex) => ({
          id: `${header.toLowerCase().replace(/\s+/g, '-')}-field-${fieldIndex}`,
          label: fieldName,
          value: '',
          type: 'text',
          tabId: header.toLowerCase().replace(/\s+/g, '-')
        }))
      }
    })

    // Merge new tabs with existing ones, avoiding duplicates
    const existingTabIds = new Set(state.tabs.map(tab => tab.id))
    const uniqueNewTabs = newTabs.filter(tab => !existingTabIds.has(tab.id))
    
    return {
      tabs: [...state.tabs, ...uniqueNewTabs]
    }
  }),
  saveData: () => {
    const state = useFieldStore.getState()
    const dataToSave = {
      tabs: state.tabs,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }
    
    // Save to localStorage
    localStorage.setItem('fieldStoreData', JSON.stringify(dataToSave))
    
    // Also create a downloadable file
    const dataStr = JSON.stringify(dataToSave, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `field-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
})) 