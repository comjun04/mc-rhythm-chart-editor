import { useState } from 'react'
import { LuMenu } from 'react-icons/lu'

import ChartEditor from './ChartEditor'
import Sidebar from './Sidebar'
import Player from './components/Player'

function App() {
  const [sidebarOpened, setSidebarOpened] = useState(false)

  return (
    <div className="relative h-full">
      <nav className="fixed top-0 flex w-full flex-row items-center bg-neutral-900 p-3">
        <h2 className="grow text-xl">Chart Editor</h2>
        <button
          className="sm:hidden"
          onClick={() => setSidebarOpened((state) => !state)}
        >
          <LuMenu size={24} />
        </button>
      </nav>

      <div className="relative mt-12 h-full overflow-x-hidden sm:flex sm:flex-row">
        <div className="relative h-full pb-12">
          <ChartEditor />
          <div className="fixed bottom-0 z-30 w-full">
            <Player />
          </div>
        </div>
        <Sidebar open={sidebarOpened} onClose={() => setSidebarOpened(false)} />
      </div>
    </div>
  )
}

export default App
