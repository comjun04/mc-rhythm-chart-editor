import { useState } from 'react'

import Lane from './components/Lane'
import type { Note } from './types'
import {LuSquare,LuRectangleVertical,LuEraser}from'react-icons/lu'
import{cn}from'./utils'

type Mode = 'addShortNote' | 'addLongNote' | 'delete'

const LANES = 5
const INITIAL_ROWS = 16

const ChartEditor = () => {
  const [rows] = useState(INITIAL_ROWS)
  const [notes, setNotes] = useState<Note[]>([])

  const [mode, setMode] = useState<Mode>('addShortNote')

  const addNote = (note: Note) => {
    setNotes((prev) => [...prev, note])
  }

  return (
    <div className="flex p-4 touch-pan-y overflow-y-scroll relative">
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button className={cn("rounded bg-slate-900 p-2", mode === 'addShortNote' && 'bg-blue-700')} onClick={()=>setMode('addShortNote')}>
          <LuSquare size={24}/>
        </button>
        <button className={cn("rounded bg-slate-900 p-2", mode === 'addLongNote' && 'bg-orange-700')} onClick={()=>setMode('addLongNote')}>
          <LuRectangleVertical size={24}/>
        </button>
        <button className="rounded bg-slate-900 p-2">
          <LuEraser size={24} />
        </button>

      </div>

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
