export type Note = {
  id: string
  lane: number
  row: number
  type: 'short' | 'long'
  length: number
}

export type SongMetadata = {
  filename: string
}

export type ChartJsonFile = {
  __product: string
  __version: number
  notes: Note[]
  bpm: number
  songMetadata: SongMetadata | null
}
