import { raf } from '@react-spring/rafz'
import { FC, useEffect, useRef } from 'react'
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

  const lastUpdatedTime = useRef(performance.now())

  useEffect(() => {
    const loop = () => {
      const now = performance.now()
      const diff = performance.now() - lastUpdatedTime.current
      addPlaybackTime(diff)
      lastUpdatedTime.current = now

      if (useEditorStore.getState().playbackPlaying) {
        return true
      }
    }

    if (playbackPlaying) {
      console.log('starting playback loop')
      lastUpdatedTime.current = performance.now()
      raf(loop)
    }

    return () => {
      raf.cancel(loop)
    }
  }, [playbackPlaying])

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
