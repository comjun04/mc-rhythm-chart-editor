import { raf } from '@react-spring/rafz'
import { type FC, useEffect, useRef, useState } from 'react'
import { LuPause, LuPlay, LuSquare } from 'react-icons/lu'
import { useShallow } from 'zustand/shallow'

import { useChartStore, useEditorStore, useSongStore } from '../store'
import { Slider } from './ui/Slider'

const Player: FC = () => {
  const {
    playbackStarted,
    playbackPlaying,
    setPlaybackStatus,
    playbackTime,
    addPlaybackTime,
    setPlaybackTime,
  } = useEditorStore(
    useShallow((state) => ({
      playbackStarted: state.playbackStarted,
      playbackPlaying: state.playbackPlaying,
      setPlaybackStatus: state.setPlaybackStatus,

      playbackTime: state.playbackTime,
      addPlaybackTime: state.addPlaybackTime,
      setPlaybackTime: state.setPlaybackTime,
    })),
  )
  const { bpm, sectorCount } = useChartStore(
    useShallow((state) => ({
      bpm: state.bpm,
      sectorCount: state.sectorCount,
    })),
  )
  const songMetadata = useSongStore((state) => state.songMetadata)

  const [sliderValueManuallyChanging, setSliderValueManuallyChanging] =
    useState(false)
  const [sliderTempValue, setSliderTempValue] = useState(0)

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

  const len = Math.max(
    songMetadata?.duration ?? 0,
    sectorCount * 4 * (60 / bpm),
  )
  const percent = (playbackTime / (len * 1000)) * 100

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

      <Slider
        value={sliderValueManuallyChanging ? [sliderTempValue] : [percent]}
        onPointerDown={() => {
          setSliderValueManuallyChanging(true)
        }}
        onValueChange={(values) => {
          setSliderTempValue(values[0])
        }}
        onValueCommit={(values) => {
          setSliderValueManuallyChanging(false)

          const percent = values[0]
          const newTime = (len / 100) * percent * 1000
          setPlaybackTime(newTime)
        }}
      />
    </div>
  )
}

export default Player
