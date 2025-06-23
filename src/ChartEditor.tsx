import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'
import { LuPlus } from 'react-icons/lu'
import { useShallow } from 'zustand/shallow'

import Lane from './components/Lane'
import ModeButtons from './components/ModeButtons'
import { LANES, NOTE_HEIGHT_REM, ROWS_PER_SECTOR } from './constants'
import { useChartStore } from './store'
import { cn } from './utils'

const ChartEditor = () => {
  const { sectorCount, addSector } = useChartStore(
    useShallow((state) => ({
      sectorCount: state.sectorCount,
      addSector: state.addSector,
    })),
  )

  const rows = sectorCount * ROWS_PER_SECTOR

  const sectorHeightRem = NOTE_HEIGHT_REM * ROWS_PER_SECTOR

  const scrollElementRef = useRef<HTMLDivElement>(null)
  const rowVirtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => NOTE_HEIGHT_REM * 16,
    scrollMargin: 140,
    overscan: 50,
  })

  const virtualItems = rowVirtualizer.getVirtualItems()

  return (
    <div className="relative h-full grow">
      {/* control buttons */}
      <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
        <ModeButtons />
      </div>

      <div className="relative h-full overflow-y-scroll" ref={scrollElementRef}>
        <div className="flex items-center justify-center p-12">
          <button
            className="flex flex-row items-center gap-2 rounded bg-gray-900 px-3 py-2"
            onClick={() => addSector()}
          >
            <LuPlus size={20} />
            <span>Add Sector</span>
          </button>
        </div>
        {/* lanes */}
        <div className="absolute z-[1] flex w-full flex-row bg-transparent px-4">
          {/* left placeholder */}
          <div className="flex flex-col pr-2">
            {[...Array(sectorCount)].map((_, idx) => {
              const sectorIndex = sectorCount - idx - 1
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
          <div className="flex flex-row overflow-x-auto">
            {[...Array(LANES)].map((_, laneIndex) => (
              <Lane
                key={laneIndex}
                laneIndex={laneIndex}
                rows={rows}
                virtualItemStartIndex={virtualItems[0]?.index ?? 0}
                virtualItemLength={virtualItems.length}
              />
            ))}
          </div>
        </div>

        {/* sector background */}
        <div className="absolute z-0 flex w-full flex-col pb-24">
          {[...Array(sectorCount)].map((_, idx) => {
            const sectorIndex = sectorCount - idx - 1

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
