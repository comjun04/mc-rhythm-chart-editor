import { useRef, useState } from 'react'

import type { Note } from '../types'

type LaneProps = {
  laneIndex: number
  rows: number
  notes: Note[]
  onAddNote: (note: Note) => void
}

const Lane = ({ laneIndex, rows, notes, onAddNote }: LaneProps) => {
  const startRef = useRef<number | null>(null)
  const holdTimer = useRef<number | null>(null)
  const [dragging, setDragging] = useState(false)

  const handleTouchStart = (row: number) => {
    startRef.current = row
    holdTimer.current = setTimeout(() => setDragging(true), 200)
  }

  const handleTouchMove = (row: number) => {
    if (dragging) {
      // Highlight if desired
    }
  }

  const handleTouchEnd = (row: number) => {
    if (holdTimer.current) clearTimeout(holdTimer.current)

    const start = startRef.current
    if (start == null) return

    if (!dragging) {
      onAddNote({ lane: laneIndex, row, type: 'short' })
    } else {
      const top = Math.min(start, row)
      const bottom = Math.max(start, row)
      onAddNote({
        lane: laneIndex,
        row: top,
        type: 'long',
        length: bottom - top + 1,
      })
    }

    setDragging(false)
    startRef.current = null
  }

  return (
    <div className="flex-col flex">
      {[...Array(rows)].map((_, rowIndex) => {
        const note = notes.find(
          (n) =>
            (n.type === 'short' && n.row === rowIndex) ||
            (n.type === 'long' &&
              rowIndex >= n.row &&
              rowIndex < n.row + (n.length || 0)),
        )
        return (
          <div
            className="h-[24px] w-[60px] border border-gray-500"
            style={{
              backgroundColor:
                note?.type === 'short'
                  ? '#3af'
                  : note?.type === 'long'
                    ? '#f83'
                    : 'transparent',
            }}
            onTouchStart={() => handleTouchStart(rowIndex)}
            onTouchMove={() => handleTouchMove(rowIndex)}
            onTouchEnd={() => handleTouchEnd(rowIndex)}
          />
        )
      })}
    </div>
  )
}

export default Lane
