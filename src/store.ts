import { nanoid } from 'nanoid'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { ROWS_PER_SECTOR } from './constants'
import { Note } from './types'

type ChartState = {
  notes: Note[]
  addNote: (noteData: Omit<Note, 'id'>) => void
  removeNote: (id: string) => void

  sectorCount: number
  addSector: () => void
  removeUnusedSectors: () => void

  tickrate: number
  setTickrate: (tickrate: number) => boolean
}
export const useChartStore = create(
  immer<ChartState>((set) => ({
    notes: [],
    addNote: (noteData) =>
      set((state) => {
        // TODO: 다른 노트랑 겹치는지 체크
        state.notes.push({
          id: nanoid(16),
          ...noteData,
        })
      }),
    removeNote: (id) =>
      set((state) => {
        const idx = state.notes.findIndex((note) => note.id === id)
        if (idx >= 0) {
          state.notes.splice(idx, 1)
        }
      }),

    sectorCount: 4,
    addSector: () =>
      set((state) => {
        state.sectorCount++
      }),
    removeUnusedSectors: () =>
      set((state) => {
        const lastNoteRow = state.notes.reduce(
          (acc, cur) => Math.max(acc, cur.row + cur.length - 1),
          0,
        )
        const lastSector = Math.floor(lastNoteRow / ROWS_PER_SECTOR)

        state.sectorCount = lastSector + 1
      }),

    tickrate: 20,
    setTickrate: (tickrate) => {
      const tickrateInt = parseInt(tickrate)
      if (isNaN(tickrate) || tickrate < 1) {
        return false
      }

      set((state) => {
        state.tickrate = tickrateInt
      })
      return true
    },
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
