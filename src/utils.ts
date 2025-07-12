import { type ClassValue, clsx } from 'clsx'
import Fraction from 'fraction.js'
import { twMerge } from 'tailwind-merge'

import { NOTE_HEIGHT_REM, ROWS_PER_SECTOR } from './constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getHeightRemPerSecond(bpm: number) {
  return (bpm / 60) * ((ROWS_PER_SECTOR / 4) * NOTE_HEIGHT_REM)
}

export function getIntegerMultiplier(x: number) {
  if (Number.isInteger(x)) return 1

  const frac = new Fraction(x)
  return Number(frac.d) // denominator
}
