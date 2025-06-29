import { FC, useState } from 'react'
import { useShallow } from 'zustand/shallow'

import { useChartStore, useEditorStore, useSongStore } from './store'
import { Note } from './types'
import { cn, getMultiplierToInteger } from './utils'

type SidebarProps = {
  open: boolean
  onClose?: () => void
}

const Sidebar: FC<SidebarProps> = ({ open, onClose = () => {} }) => {
  const { bpm, setBpm, removeUnusedSectors } = useChartStore(
    useShallow((state) => ({
      bpm: state.bpm,
      setBpm: state.setBpm,
      removeUnusedSectors: state.removeUnusedSectors,
    })),
  )
  const { playbackStarted, playbackPlaying, setPlaybackStatus } =
    useEditorStore(
      useShallow((state) => ({
        playbackStarted: state.playbackStarted,
        playbackPlaying: state.playbackPlaying,
        setPlaybackStatus: state.setPlaybackStatus,
      })),
    )
  const songMetadata = useSongStore((state) => state.songMetadata)

  const controlsDisabled = playbackStarted

  const [tempBpm, setTempBpm] = useState(bpm)

  return (
    <>
      <div
        className={cn(
          'fixed left-0 top-0 z-[29] h-full w-full bg-black/60 transition duration-200',
          open
            ? 'sm:pointer-events-none sm:opacity-0'
            : 'pointer-events-none opacity-0',
        )}
        onClick={() => onClose()}
      />
      <div
        className={cn(
          'fixed right-0 top-0 z-30 h-full w-[80vw] bg-neutral-800 p-4 transition duration-200 sm:static sm:w-72',
          !open && 'translate-x-full sm:translate-x-0',
        )}
      >
        <h3 className="text-xl">Sidebar</h3>

        <div className="mt-6 flex flex-col gap-1">
          <h5>Song</h5>
          <div className="flex flex-col items-start gap-2">
            {songMetadata != null ? (
              <>
                <span>{songMetadata.filename}</span>
                <button
                  className={cn(
                    'rounded bg-red-700 px-3 py-1',
                    controlsDisabled && 'opacity-70',
                  )}
                  onClick={() => {
                    if (window.confirm('Are you sure to remove the song?')) {
                      useSongStore.getState().setSong(null)
                    }
                  }}
                  disabled={controlsDisabled}
                >
                  Remove
                </button>
              </>
            ) : (
              <button
                className={cn(
                  'rounded bg-gray-900 px-3 py-1',
                  controlsDisabled && 'opacity-70',
                )}
                onClick={() => {
                  const inputElement = document.createElement('input')
                  inputElement.type = 'file'
                  inputElement.accept = 'audio/*'
                  inputElement.onchange = (evt) => {
                    const file = (evt.target as HTMLInputElement).files?.[0]
                    if (file == null) {
                      return
                    }

                    useSongStore.getState().setSong(file).catch(console.error)
                  }

                  inputElement.click()
                }}
                disabled={controlsDisabled}
              >
                Add Song
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-1">
          <h5>Song BPM</h5>
          <div className="flex flex-row gap-2">
            <input
              type="number"
              min={0}
              step={0.01}
              placeholder="BPM"
              className={cn(
                'w-20 bg-gray-900 p-1 text-end',
                controlsDisabled && 'opacity-70',
              )}
              value={tempBpm}
              onChange={(evt) => setTempBpm(Number(evt.target.value))}
              disabled={controlsDisabled}
            />
            <button
              className={cn(
                'rounded bg-green-700 px-3 py-1',
                controlsDisabled && 'opacity-70',
              )}
              onClick={() => {
                const result = setBpm(tempBpm)
                if (!result) {
                  window.alert('[!] Failed to set BPM')
                }
              }}
              disabled={controlsDisabled}
            >
              Apply
            </button>
            <button
              className={cn(
                'rounded bg-red-700 px-3 py-1',
                controlsDisabled && 'opacity-70',
              )}
              onClick={() => setTempBpm(bpm)}
              disabled={controlsDisabled}
            >
              Reset
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-1">
          <h5>Save/Load</h5>
          <div className="flex flex-row gap-2">
            <button className="rounded bg-gray-900 px-3 py-1">Save</button>
            <button className="rounded bg-gray-900 px-3 py-1">Load</button>
            <button
              className="rounded bg-blue-800 px-3 py-1"
              onClick={() => {
                const { notes, bpm } = useChartStore.getState()
                const subBeatsPerSecond = (bpm / 60) * 4
                const tickrateMultiplier =
                  getMultiplierToInteger(subBeatsPerSecond)
                const tickrate = Math.floor(
                  subBeatsPerSecond * tickrateMultiplier,
                )

                const sortedNotesByLane: Note[][] = [[], [], [], [], []]
                const transformedDataArr: (number | 'l')[][] = [
                  [],
                  [],
                  [],
                  [],
                  [],
                ]

                notes.forEach((note) => sortedNotesByLane[note.lane].push(note))
                sortedNotesByLane.forEach((noteArr, idx) => {
                  noteArr.sort((a, b) => a.row - b.row)
                  noteArr.forEach((note) => {
                    const start = note.row * tickrateMultiplier
                    const end =
                      (note.row + note.length - 1) * tickrateMultiplier
                    if (note.type === 'long') {
                      transformedDataArr[idx].push('l', start, end)
                    } else {
                      transformedDataArr[idx].push(start)
                    }
                  })
                })

                // total chart length
                const length = Math.max(
                  ...transformedDataArr.map(
                    (lane) => (lane[lane.length - 1] as number) ?? 0,
                  ),
                )
                // fill empty lines with -99999
                transformedDataArr.forEach((lane) => {
                  if (lane.length < 1) {
                    lane.push(-99999)
                  }
                })

                const finaldata = {
                  a: transformedDataArr[0],
                  b: transformedDataArr[1],
                  c: transformedDataArr[2],
                  d: transformedDataArr[3],
                  e: transformedDataArr[4],
                  keys: 5,
                  length,
                  tick: tickrate,
                }

                try {
                  navigator.clipboard.writeText(JSON.stringify(finaldata))
                  window.alert('Exported to clipboard')
                } catch (e) {
                  console.error(e)
                  window.alert('[!] Failed to export: cannot copy to clipboard')
                }
              }}
            >
              Export
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-1">
          <h5>Preview</h5>
          <div className="flex flex-row gap-2">
            {playbackPlaying ? (
              <button
                className="rounded bg-gray-900 px-3 py-1"
                onClick={() => setPlaybackStatus('pause')}
              >
                Pause
              </button>
            ) : (
              <button
                className="rounded bg-gray-900 px-3 py-1"
                onClick={() => setPlaybackStatus('play')}
              >
                Play
              </button>
            )}

            <button
              className="rounded bg-red-900 px-3 py-1"
              onClick={() => setPlaybackStatus('stop')}
            >
              Stop
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-1">
          <h5>Misc</h5>
          <div className="flex flex-row gap-2">
            <button
              className={cn(
                'rounded bg-gray-900 px-3 py-1',
                controlsDisabled && 'opacity-70',
              )}
              onClick={() => removeUnusedSectors()}
              disabled={controlsDisabled}
            >
              Remove unused sectors
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
