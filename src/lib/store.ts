import { create } from 'zustand'

interface FieldStore {
  name: string
  username: string
  setName: (name: string) => void
  setUsername: (username: string) => void
  swapFields: () => void
}

export const useFieldStore = create<FieldStore>((set) => ({
  name: 'Pedro Duarte',
  username: '@peduarte',
  setName: (name) => set({ name }),
  setUsername: (username) => set({ username }),
  swapFields: () => set((state) => ({ 
    name: state.username, 
    username: state.name 
  }))
})) 