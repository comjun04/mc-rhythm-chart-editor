import { Howl } from 'howler'
import { nanoid } from 'nanoid'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { ROWS_PER_SECTOR } from './constants'
import { Note, SongMetadata } from './types'

type ChartState = {
  notes: Note[]
  addNote: (noteData: Omit<Note, 'id'>) => void
  removeNote: (id: string) => void

  sectorCount: number
  addSector: () => void
  removeUnusedSectors: () => void

  bpm: number
  setBpm: (bpm: number) => boolean

  loadProject: (projectData: { notes: Omit<Note, 'id'>[]; bpm: number }) => void
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

    loadProject: (projectData) =>
      set((state) => {
        state.notes = projectData.notes.map((note) => ({
          id: nanoid(16),
          ...note,
        }))
        state.bpm = projectData.bpm

        const lastNoteRow = state.notes.reduce(
          (acc, cur) => Math.max(acc, cur.row + cur.length - 1),
          0,
        )
        state.sectorCount = Math.floor(lastNoteRow / ROWS_PER_SECTOR) + 1
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

          songHowl?.play()
        } else if (status === 'pause') {
          state.playbackPlaying = false

          songHowl?.pause()
        } else {
          state.playbackPlaying = false
          state.playbackStarted = false

          songHowl?.stop()
        }
      }),
    addPlaybackTime: (time) =>
      set((state) => {
        state.playbackTime += time
      }),
  })),
)

// song store

let songBlob: Blob | null = null
let songHowl: Howl | null = null

type SongState = {
  songMetadata: SongMetadata | null
  setSong: (song: { songBlob: Blob; filename: string } | null) => Promise<void>
  getSongBlob: () => Blob | null
}
export const useSongStore = create(
  immer<SongState>((set) => ({
    songMetadata: null,
    setSong: async (song) => {
      if (song == null) {
        songHowl?.unload()
        songHowl = null
        song = null
        return set((state) => {
          state.songMetadata = null
        })
      }

      const fileReader = new FileReader()
      const base64DataUrl = await new Promise<string>((resolve) => {
        fileReader.onload = (evt) => {
          resolve(evt.target!.result as string)
        }
        fileReader.readAsDataURL(song.songBlob)
      })

      const howl = new Howl({ src: base64DataUrl, format: ['mp3'] })

      songHowl?.unload()
      songHowl = howl
      songBlob = song.songBlob

      set((state) => {
        state.songMetadata = {
          filename: song.filename,
        }
      })
    },
    getSongBlob: () => songBlob,
  })),
)
