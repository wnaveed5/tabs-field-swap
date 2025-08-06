import { create } from 'zustand'

interface Field {
  id: string
  label: string
  value: string
  type: string
}

interface FieldStore {
  fields: Field[]
  setFieldValue: (id: string, value: string) => void
  swapFields: () => void
  reorderFields: (oldIndex: number, newIndex: number) => void
}

export const useFieldStore = create<FieldStore>((set) => ({
  fields: [
    { id: 'name', label: 'Name', value: 'Pedro Duarte', type: 'text' },
    { id: 'username', label: 'Username', value: '@peduarte', type: 'text' }
  ],
  setFieldValue: (id, value) => set((state) => ({
    fields: state.fields.map(field => 
      field.id === id ? { ...field, value } : field
    )
  })),
  swapFields: () => set((state) => {
    const [first, second] = state.fields
    return {
      fields: [
        { ...second, value: first.value },
        { ...first, value: second.value }
      ]
    }
  }),
  reorderFields: (oldIndex, newIndex) => set((state) => {
    const newFields = [...state.fields]
    const [movedField] = newFields.splice(oldIndex, 1)
    newFields.splice(newIndex, 0, movedField)
    return { fields: newFields }
  })
})) 