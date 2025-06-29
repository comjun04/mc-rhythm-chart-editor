import JSZip from 'jszip'

import { useChartStore, useSongStore } from '../store'

export async function saveFile() {
  const { notes, bpm } = useChartStore.getState()
  const { getSongFile, songMetadata } = useSongStore.getState()

  // remove 'id' from notes
  const strippedNotes = notes.map((note) => {
    const { id: _, ...rest } = note
    return rest
  })

  const savedata = {
    __product: 'mc-rhythm-chart-editor',
    __version: 0,
    notes: strippedNotes,
    bpm,
    songMetadata,
  }
  console.log(savedata)

  const zip = new JSZip()
  zip.file('chart.json', JSON.stringify(savedata))

  const songFile = getSongFile()
  if (songFile != null) {
    zip.file(`song`, songFile)
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
