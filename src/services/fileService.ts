import JSZip from 'jszip'

import { useChartStore, useEditorStore, useSongStore } from '../store'
import { ChartJsonFile } from '../types'

const PRODUCT = 'mc-rhythm-chart-editor'
const CURRENT_FILE_VERSION = 0

export async function saveFile() {
  const { notes, bpm } = useChartStore.getState()
  const { getSongBlob, songMetadata } = useSongStore.getState()

  // remove 'id' from notes
  const strippedNotes = notes.map((note) => {
    const { id: _, ...rest } = note
    return rest
  })

  const savedata = {
    __product: PRODUCT,
    __version: CURRENT_FILE_VERSION,
    notes: strippedNotes,
    bpm,
    songMetadata,
  }

  const zip = new JSZip()
  zip.file('chart.json', JSON.stringify(savedata))

  const songBlob = getSongBlob()
  if (songBlob != null) {
    zip.file(`song`, songBlob)
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const objUrl = URL.createObjectURL(zipBlob)
  const linkEl = document.createElement('a')
  linkEl.href = objUrl
  linkEl.download = 'chart.zip'

  linkEl.click()
  setTimeout(() => {
    URL.revokeObjectURL(objUrl)
  }, 100)
}

export async function loadFile(file: File) {
  const zip = await JSZip.loadAsync(file)

  // check for chart.json
  const chartJsonFile = zip.file('chart.json')
  if (chartJsonFile == null) {
    console.error('chart.json not found, not a vaild project file')
    return
  }

  const chartJson = JSON.parse(
    await chartJsonFile.async('text'),
  ) as ChartJsonFile
  if (chartJson.__product !== PRODUCT) {
    console.error('chart.json is not the correct format')
    return
  } else if (chartJson.__version > CURRENT_FILE_VERSION) {
    console.error(
      'chart.json file version is higher than this program supports.',
    )
    return
  }

  const { setSong } = useSongStore.getState()

  // check for song file
  const songFile = zip.file('song')
  if (songFile != null && chartJson.songMetadata != null) {
    const songBlob = await songFile.async('blob')
    setSong({ songBlob, filename: chartJson.songMetadata.filename })
  } else {
    setSong(null)
  }

  // actually load
  useChartStore.getState().loadProject({
    notes: chartJson.notes,
    bpm: chartJson.bpm,
  })

  const { setPlaybackStatus, setLongNoteStartPos } = useEditorStore.getState()
  setPlaybackStatus('stop')
  setLongNoteStartPos(null)
}
