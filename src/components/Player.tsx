import { type FC } from 'react'
import { LuPause, LuPlay, LuSquare } from 'react-icons/lu'
import { useShallow } from 'zustand/shallow'

import { useEditorStore, useSongStore } from '../store'
import { Slider } from './ui/Slider'

const Player: FC = () => {
  const { playbackStarted, playbackPlaying, setPlaybackStatus, playbackTime } =
    useEditorStore(
      useShallow((state) => ({
        playbackStarted: state.playbackStarted,
        playbackPlaying: state.playbackPlaying,
        setPlaybackStatus: state.setPlaybackStatus,

        playbackTime: state.playbackTime,
      })),
    )
  const songMetadata = useSongStore((state) => state.songMetadata)

  const len = songMetadata?.duration ?? 0
  const percent = (playbackTime / ((songMetadata?.duration ?? 1) * 1000)) * 100

  return (
    <div className="flex h-12 w-full flex-row items-center gap-2 bg-neutral-700/80 px-4">
      <button
        onClick={() => {
          setPlaybackStatus(playbackPlaying ? 'pause' : 'play')
        }}
      >
        {playbackPlaying ? <LuPause size={24} /> : <LuPlay size={24} />}
      </button>
      <button onClick={() => setPlaybackStatus('stop')}>
        <LuSquare size={24} />
      </button>

      <Slider value={[percent]} />
    </div>
  )
}

export default Player
