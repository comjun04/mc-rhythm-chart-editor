import { FC } from 'react'

import { cn } from './utils'

type SidebarProps = {
  open: boolean
  onClose?: () => void
}

const Sidebar: FC<SidebarProps> = ({ open, onClose = () => {} }) => {
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
          'fixed right-0 top-0 z-30 h-full w-[70vw] bg-neutral-800 p-4 transition duration-200 sm:static sm:w-48',
          !open && 'translate-x-full sm:translate-x-0',
        )}
      >
        <h3 className="text-xl">Sidebar</h3>
      </div>
    </>
  )
}

export default Sidebar
