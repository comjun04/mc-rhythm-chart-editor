import { FC, useState } from 'react'
import { useShallow } from 'zustand/shallow'

import { useChartStore } from './store'
import { cn } from './utils'

type SidebarProps = {
  open: boolean
  onClose?: () => void
}

const Sidebar: FC<SidebarProps> = ({ open, onClose = () => {} }) => {
  const { tickrate, setTickrate, removeUnusedSectors } = useChartStore(
    useShallow((state) => ({
      tickrate: state.tickrate,
      setTickrate: state.setTickrate,
      removeUnusedSectors: state.removeUnusedSectors,
    })),
  )

  const [tempTickrate, setTempTickrate] = useState(tickrate)

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
          <h5>Tickrate</h5>
          <div className="flex flex-row gap-2">
            <input
              type="number"
              placeholder="ticks per second"
              className="w-20 bg-gray-900 p-1 text-end"
              value={tempTickrate}
              onChange={(evt) => setTempTickrate(evt.target.value)}
            />
            <button
              className="rounded bg-green-700 px-3 py-1"
              onClick={() => {
                const result = setTickrate(tempTickrate)
                if (!result) {
                  window.alert('Tickrate set failed')
                }
              }}
            >
              Apply
            </button>
            <button
              className="rounded bg-red-700 px-3 py-1"
              onClick={() => setTempTickrate(tickrate)}
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
                const { notes, tickrate } = useChartStore.getState()

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
                    const start = note.row * tickrate
                    const end = (note.row + note.length - 1) * tickrate
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
                    (lane) => lane[lane.length - 1] ?? 0,
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
                  window.alert('Failed to export: cannot copy to clipboard')
                }
              }}
            >
              Export
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-1">
          <h5>Misc</h5>
          <div className="flex flex-row gap-2">
            <button
              className="rounded bg-gray-900 px-3 py-1"
              onClick={() => removeUnusedSectors()}
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
