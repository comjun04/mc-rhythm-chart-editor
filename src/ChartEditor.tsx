import { useState } from 'react'
import { LuEraser, LuRectangleVertical, LuSquare } from 'react-icons/lu'
import { useShallow } from 'zustand/react/shallow'

import Lane from './components/Lane'
import { useEditorStore } from './store'
import { cn } from './utils'

const LANES = 5
const INITIAL_ROWS = 16

const ChartEditor = () => {
  const [rows] = useState(INITIAL_ROWS)

  const { mode, setMode } = useEditorStore(
    useShallow((state) => ({
      mode: state.mode,
      setMode: state.setMode,
    })),
  )

  return (
    <div className="relative flex touch-pan-y overflow-y-scroll p-4">
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
        <button className="rounded bg-slate-900 p-2">
          <LuEraser size={24} />
        </button>
      </div>

      {[...Array(LANES)].map((_, laneIndex) => (
        <Lane key={laneIndex} laneIndex={laneIndex} rows={rows} />
      ))}
    </div>
  )
}

export default ChartEditor
