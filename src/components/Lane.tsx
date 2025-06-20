import { useRef, useState } from 'react'

import type { Note } from '../types'
import { cn } from '../utils'

type LaneProps = {
  laneIndex: number
  rows: number
  notes: Note[]
  onAddNote: (note: Note) => void
}

const Lane = ({ laneIndex, rows, notes, onAddNote }: LaneProps) => {
  const holdTimer = useRef<number | null>(null)

  const [selectionStartRow, setSelectionStartRow] = useState(0)
  const [selectionEndRow, setSelectionEndRow]=useState(0)
  const [noteCreationMode, setNoteCreationMode] = useState(false)
  const [selectingPointerId, setSelectingPointerId]=useState(0)

  const handlePointerDown = (evt: PointerEvent, row: number) => {
    if (noteCreationMode || holdTimer.current != null) return

    setSelectingPointerId(evt.pointerId)
    setSelectionStartRow(row)
    if (evt.pointerType === 'touch') {
      holdTimer.current = setTimeout(() => setNoteCreationMode(true), 200)
    } else {
      setNoteCreationMode(true)
    }
  }

  const handlePointerMove = (evt: PointerEvent, row: number) => {
    if (evt.pointerId !== selectingPointerId) return

    if (evt.pointerType === 'touch') {
      if (!noteCreationMode && selectionStartRow !== row) {
        // 홀드 대기시간 이전에 다른 row로 이동
        // 노트 생성 작업 취소
        clearTimeout(holdTimer.current)
        holdTimer.current = null
      }
    }
  }

  const handlePointerUp = (evt: PointerEvent, row: number) => {
    if (!noteCreationMode || evt.pointerId !== selectingPointerId) {
      // alert(`a ${noteCreationMode} ${evt.pointerId} ${selectingPointerId}`)
      return
    }

    if (holdTimer.current) {
      clearTimeout(holdTimer.current)
      holdTimer.current = null
    }

    // alert('gen ok')
    // alert(`a ${noteCreationMode} ${evt.pointerId} ${selectingPointerId} / ${selectionStartRow} ${row}`)

    if (selectionStartRow === row) {
      onAddNote({ lane: laneIndex, row, type: 'short' })
    } else {
      const top = Math.min(selectionStartRow, row)
      const bottom = Math.max(selectionStartRow, row)
      onAddNote({
        lane: laneIndex,
        row: top,
        type: 'long',
        length: bottom - top + 1,
      })
    }

    setNoteCreationMode(false)
  }

  return (
    <div className="flex flex-col">
      {/* grid */}
      {[...Array(rows)].map((_, idx) => (
        <div
          key={idx}
          className="h-6 w-[60px] border border-gray-500 relative"
          onPointerDown={(evt) => handlePointerDown(evt, idx)}
          onPointerMove={(evt) => handlePointerMove(evt, idx)}
          onPointerUp={(evt)=>handlePointerUp(evt, idx)}
          onPointerCancel={()=>{}}
        />
      ))}

      {/* notes */}
      {notes.map((note, idx) => {
        return (
          <div
            key={idx}
            className={cn(
              'w-[60px] absolute',
              note.type === 'short' && 'bg-blue-700',
              note.type === 'long' && 'bg-orange-700',
            )}
            style={{
              height: 60,
                top: 30
            }}
          />
        )
      })}

      {/*[...Array(rows)].map((_, rowIndex) => {
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
      })*/}
    </div>
  )
}

export default Lane
