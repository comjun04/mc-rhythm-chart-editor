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

  bpm: number
  setBpm: (bpm: number) => boolean
}
export const useChartStore = create(
  immer<ChartState>((set) => ({
    notes: [],
    addNote: (noteData) =>
      set((state) => {
        // 다른 노트랑 겹치는지 체크
        const newNoteStartRow = noteData.row
        const newNoteEndRow = noteData.row + noteData.length - 1
        const isOverlapping = state.notes
          .filter((note) => note.lane === noteData.lane)
          .some((note) => {
            const noteStartRow = note.row
            const noteEndRow = note.row + note.length - 1
            return !(
              newNoteStartRow >= noteEndRow || newNoteEndRow <= noteStartRow
            )
          })
        if (isOverlapping) {
          console.warn(
            'useChartStore.addNote: Attempted to add note which overlaps other notes. Ignoring.',
          )
          return
        }

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

    bpm: 120,
    setBpm: (bpm) => {
      if (isNaN(bpm) || bpm <= 0) {
        return false
      }

      set((state) => {
        state.bpm = bpm
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

  playbackPlaying: boolean
  playbackStarted: boolean
  playbackTime: number
  setPlaybackStatus: (status: 'play' | 'pause' | 'stop') => void
  addPlaybackTime: (time: number) => void
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

    playbackPlaying: false,
    playbackStarted: false,
    playbackTime: 0,
    setPlaybackStatus: (status) =>
      set((state) => {
        if (status === 'play') {
          if (!state.playbackStarted) {
            state.playbackStarted = true
            state.playbackTime = 0
          }
          state.playbackPlaying = true
        } else if (status === 'pause') {
          state.playbackPlaying = false
        } else {
          state.playbackPlaying = false
          state.playbackStarted = false
        }
      }),
    addPlaybackTime: (time) =>
      set((state) => {
        state.playbackTime += time
      }),
  })),
)
