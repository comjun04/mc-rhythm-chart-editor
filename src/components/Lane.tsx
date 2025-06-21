import { useShallow } from 'zustand/react/shallow'

import { useChartStore, useEditorStore } from '../store'
import { cn } from '../utils'

type LaneProps = {
  laneIndex: number
  rows: number
}

const Lane = ({ laneIndex, rows }: LaneProps) => {
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
  const { notes, addNote, removeNote } = useChartStore(
    useShallow((state) => ({
      notes: state.notes,
      addNote: state.addNote,
      removeNote: state.removeNote,
    })),
  )

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
                if (
                  tempLongNoteStartPos != null &&
                  tempLongNoteStartPos.lane === laneIndex
                ) {
                  if (tempLongNoteStartPos.row !== row) {
                    addNote({
                      lane: laneIndex,
                      row: Math.min(tempLongNoteStartPos.row, row),
                      type: 'long',
                      length: Math.abs(tempLongNoteStartPos.row - row) + 1,
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
        .map((note) => {
          return (
            <div
              key={note.id}
              className={cn(
                'absolute w-[60px] border-4',
                note.type === 'short' && 'border-blue-950/70 bg-blue-700/80',
                note.type === 'long' && 'border-orange-950/70 bg-orange-700/80',
              )}
              style={{
                height: `${note.length * 1.5}rem`,
                bottom: `${note.row * 1.5}rem`,
              }}
              onClick={() => {
                if (editorMode === 'delete') {
                  removeNote(note.id)
                }
              }}
            />
          )
        })}
    </div>
  )
}

export default Lane
