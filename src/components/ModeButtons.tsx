import { FC } from 'react'
import { LuEraser, LuRectangleVertical, LuSquare } from 'react-icons/lu'
import { useShallow } from 'zustand/shallow'

import { useEditorStore } from '../store'
import { cn } from '../utils'

const ModeButtons: FC = () => {
  const { mode, setMode } = useEditorStore(
    useShallow((state) => ({
      mode: state.mode,
      setMode: state.setMode,
    })),
  )

  return (
    <>
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
    </>
  )
}

export default ModeButtons
