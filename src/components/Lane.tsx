import { useShallow } from 'zustand/react/shallow'

import { NOTE_HEIGHT_REM } from '../constants'
import { useChartStore, useEditorStore } from '../store'
import { cn } from '../utils'

type LaneProps = {
  laneIndex: number
  rows: number

  virtualItemStartIndex: number
  virtualItemLength: number
}

const Lane = ({
  laneIndex,
  rows,
  virtualItemStartIndex,
  virtualItemLength,
}: LaneProps) => {
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
    <div className="relative flex w-[60px] flex-none flex-col">
      {/* grid */}
      {[...Array(virtualItemLength)].map((_, idx) => {
        const row = rows - virtualItemStartIndex - idx - 1
        const isLongNoteStartPos = tempLongNoteStartPos?.row === row

        return (
          <div
            key={row}
            className={cn(
              'absolute left-0 top-0 h-6 w-full border border-gray-500',
              isLongNoteStartPos && 'bg-orange-500/30',
            )}
            style={{
              transform: `translateY(${(virtualItemStartIndex + idx) * NOTE_HEIGHT_REM}rem)`,
            }}
            onClick={() => {
              if (useEditorStore.getState().playbackPlaying) {
                return
              }

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
                height: `${note.length * NOTE_HEIGHT_REM}rem`,
                bottom: `${note.row * NOTE_HEIGHT_REM}rem`,
              }}
              onClick={() => {
                if (useEditorStore.getState().playbackPlaying) {
                  return
                }

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
