import { useState } from 'react'
import { LuEraser, LuPlus, LuRectangleVertical, LuSquare } from 'react-icons/lu'
import { useShallow } from 'zustand/react/shallow'

import Lane from './components/Lane'
import {
  INITIAL_SECTORS,
  LANES,
  NOTE_HEIGHT_REM,
  ROWS_PER_SECTOR,
} from './constants'
import { useEditorStore } from './store'
import { cn } from './utils'

const ChartEditor = () => {
  const [sectors, setSectors] = useState(INITIAL_SECTORS)
  const rows = sectors * ROWS_PER_SECTOR

  const sectorHeightRem = NOTE_HEIGHT_REM * ROWS_PER_SECTOR

  const { mode, setMode } = useEditorStore(
    useShallow((state) => ({
      mode: state.mode,
      setMode: state.setMode,
    })),
  )

  return (
    <div className="relative h-full overflow-y-scroll">
      {/* control buttons */}
      <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
        <button
          className={cn(
            'rounded bg-slate-900 p-2',
            mode === 'addShortNote' && 'bg-blue-700',
          )}
          onClick={() => setMode('addShortNote')}
        >
          <LuSquare size={24} />
        </button>
        <button
          className={cn(
            'rounded bg-slate-900 p-2',
            mode === 'addLongNote' && 'bg-orange-700',
          )}
          onClick={() => setMode('addLongNote')}
        >
          <LuRectangleVertical size={24} />
        </button>
        <button
          className={cn(
            'rounded bg-slate-900 p-2',
            mode === 'delete' && 'bg-red-900',
          )}
          onClick={() => setMode('delete')}
        >
          <LuEraser size={24} />
        </button>
      </div>

      <div className="relative h-full overflow-y-scroll">
        <div className="flex items-center justify-center p-12">
          <button
            className="flex flex-row items-center gap-2 rounded bg-gray-900 px-3 py-2"
            onClick={() => setSectors((cur) => cur + 1)}
          >
            <LuPlus size={20} />
            <span>Add Sector</span>
          </button>
        </div>
        {/* lanes */}
        <div className="absolute z-[1] flex flex-row bg-transparent px-4">
          {/* left placeholder */}
          <div className="flex flex-col pr-2">
            {[...Array(sectors)].map((_, idx) => {
              const sectorIndex = sectors - idx - 1
              return (
                <div
                  key={sectorIndex}
                  className={cn('flex flex-col items-end justify-end')}
                  style={{
                    height: `${sectorHeightRem}rem`,
                  }}
                >
                  <span className="text-nowrap">
                    #{sectorIndex} {sectorIndex * ROWS_PER_SECTOR + 1}
                  </span>
                </div>
              )
            })}
          </div>
          {/* real lane */}
          {[...Array(LANES)].map((_, laneIndex) => (
            <Lane key={laneIndex} laneIndex={laneIndex} rows={rows} />
          ))}
        </div>

        {/* sector background */}
        <div className="absolute z-0 flex w-full flex-col pb-24">
          {[...Array(sectors)].map((_, idx) => {
            const sectorIndex = sectors - idx - 1

            return (
              <div
                key={sectorIndex}
                className={cn(
                  'w-full',
                  sectorIndex % 2 === 0 ? 'bg-gray-800/60' : 'bg-gray-900/60',
                )}
                style={{
                  height: `${sectorHeightRem}rem`,
                  bottom: `${sectorIndex * sectorHeightRem}rem`,
                }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ChartEditor
