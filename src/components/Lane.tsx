import { useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useChartStore, useEditorStore } from '../store'
import type { Note } from '../types'
import { cn } from '../utils'

type LaneProps = {
  laneIndex: number
  rows: number
  notes: Note[]
  onAddNote: (note: Note) => void
}

const Lane = ({ laneIndex, rows, onAddNote }: LaneProps) => {
  const { editorMode, tempLongNoteStartPos, setTempLongNoteStartPos } =
    useEditorStore(
      useShallow((state) => {
        const longNoteStartPosInCurrentLane =
          state.longNoteStartPos?.lane === laneIndex
        return {
          editorMode: state.mode,
          tempLongNoteStartPos: longNoteStartPosInCurrentLane
            ? state.longNoteStartPos
            : null,
          setTempLongNoteStartPos: state.setLongNoteStartPos,
        }
      }),
    )
  const { notes, addNote } = useChartStore(
    useShallow((state) => ({
      notes: state.notes,
      addNote: state.addNote,
    })),
  )

  const holdTimer = useRef<number | null>(null)

  const [selectionStartRow, setSelectionStartRow] = useState(0)
  const [selectionEndRow, setSelectionEndRow] = useState(0)
  const [noteCreationMode, setNoteCreationMode] = useState(false)
  const [selectingPointerId, setSelectingPointerId] = useState(0)

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
    <div className="relative flex flex-col">
      {/* grid */}
      {[...Array(rows)].map((_, idx) => {
        const row = rows - idx - 1
        const isLongNoteStartPos = tempLongNoteStartPos?.row === row

        return (
          <div
            key={row}
            className={cn(
              'relative h-6 w-[60px] border border-gray-500',
              isLongNoteStartPos && 'bg-orange-500/30',
            )}
            onClick={() => {
              if (editorMode === 'addShortNote') {
                addNote({
                  lane: laneIndex,
                  row,
                  type: 'short',
                  length: 1,
                })
              } else if (editorMode === 'addLongNote') {
                if (tempLongNoteStartPos != null && tempLongNoteStartPos.lane === laneIndex) {
                  if (tempLongNoteStartPos.row !== row) {
                  addNote({
                    lane: laneIndex,
                    row: Math.min(tempLongNoteStartPos.row, row),
                    type: 'long',
                    length: Math.abs(tempLongNoteStartPos.row - row) + 1
                  })
                  }

                  setTempLongNoteStartPos(null)
                } else {
                  setTempLongNoteStartPos({ lane: laneIndex, row })
                }
              }
            }}
          />
        )
      })}

      {/* notes */}
      {notes
        .filter((note) => note.lane === laneIndex)
        .map((note, idx) => {
          return (
            <div
              key={idx}
              className={cn(
                'absolute w-[60px]',
                note.type === 'short' && 'bg-blue-700',
                note.type === 'long' && 'bg-orange-700',
              )}
              style={{
                height: `${note.length * 1.5}rem`,
                bottom: `${note.row * 1.5}rem`,
              }}
            />
          )
        })}
    </div>
  )
}

export default Lane
