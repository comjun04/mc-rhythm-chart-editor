import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { Note } from './types'

type ChartState = {
  notes: Note[]
  addNote: (note: Note) => void
  removeNote: (idx: number) => void
}
export const useChartStore = create(
  immer<ChartState>((set) => ({
    notes: [],
    addNote: (note) =>
      set((state) => {
        // TODO: 다른 노트랑 겹치는지 체크
        state.notes.push(note)
      }),
    removeNote: (idx) =>
      set((state) => {
        if (idx < 0 || idx >= state.notes.length) return
        state.notes.splice(idx, 1)
      }),
  })),
)

type EditorMode = 'addShortNote' | 'addLongNote' | 'delete'
type EditorState = {
  mode: EditorMode
  setMode: (newMode: EditorMode) => void

  longNoteStartPos: {
    lane: number
    row: number
  } | null
  setLongNoteStartPos: (startPos: { lane: number; row: number } | null) => void
}
export const useEditorStore = create(
  immer<EditorState>((set) => ({
    mode: 'addShortNote',
    setMode: (newMode) =>
      set((state) => {
        state.mode = newMode

        if (newMode !== 'addLongNote') {
          state.longNoteStartPos = null
        }
      }),

    longNoteStartPos: null,
    setLongNoteStartPos: (startPos) =>
      set((state) => {
        state.longNoteStartPos = startPos
      }),
  })),
)
