import { useState } from 'react'

import Lane from './components/Lane'
import type { Note } from './types'

const LANES = 5
const INITIAL_ROWS = 16

const ChartEditor = () => {
  const [rows] = useState(INITIAL_ROWS)
  const [notes, setNotes] = useState<Note[]>([])

  const addNote = (note: Note) => {
    setNotes((prev) => [...prev, note])
  }

  return (
    <div className="flex touch-pan-y overflow-y-scroll">
      {[...Array(LANES)].map((_, laneIndex) => (
        <Lane
          key={laneIndex}
          laneIndex={laneIndex}
          rows={rows}
          notes={notes.filter((n) => n.lane === laneIndex)}
          onAddNote={addNote}
        />
      ))}
    </div>
  )
}

export default ChartEditor
