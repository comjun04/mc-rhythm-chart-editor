import { FC } from 'react'
import { useShallow } from 'zustand/shallow'

import { useChartStore, useEditorStore } from '../store'
import { getHeightRemPerSecond } from '../utils'

const PlaybackLine: FC = () => {
  const { playbackPlaying, playbackTime, addPlaybackTime } = useEditorStore(
    useShallow((state) => ({
      playbackPlaying: state.playbackPlaying,
      playbackTime: state.playbackTime,
      addPlaybackTime: state.addPlaybackTime,
    })),
  )
  const { bpm } = useChartStore(
    useShallow((state) => ({
      bpm: state.bpm,
    })),
  )

  return (
    <hr
      className="absolute z-10 w-full border-t-2 border-red-500"
      style={{
        bottom: 0,
        transform: `translateY(-${getHeightRemPerSecond(bpm) * (playbackTime / 1000)}rem)`,
      }}
    />
  )
}

export default PlaybackLine
