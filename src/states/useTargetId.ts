import { create } from 'zustand'

interface ITargetIdState {
  targetId: number | null
  setTargetId: (targetId: number) => void
  resetTargetId: () => void
}

const useTargetId = create<ITargetIdState>((set) => ({
  targetId: null,
  setTargetId: (targetId: number) => set({ targetId }),
  resetTargetId: () => set({ targetId: null }),
}))

export default useTargetId
