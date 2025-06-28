import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { NOTE_HEIGHT_REM, ROWS_PER_SECTOR } from './constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getHeightRemPerSecond(bpm: number) {
  return (bpm / 60) * ((ROWS_PER_SECTOR / 4) * NOTE_HEIGHT_REM)
}

export function getMultiplierToInteger(x: number) {
  if (Number.isInteger(x)) return 1

  // Convert number to a fixed-point string
  const str = x.toFixed(2)

  // Strip trailing zeros
  const trimmed = str.replace(/\.?0+$/, '')

  // Get digits after decimal point
  const decimalPart = trimmed.split('.')[1]
  const decimalLength = decimalPart?.length || 0

  const factor = 10 ** decimalLength
  const numerator = Math.round(x * factor)
  const denominator = factor

  // GCD helper
  function gcd(a: number, b: number): number {
    return b ? gcd(b, a % b) : a
  }

  const divisor = gcd(numerator, denominator)
  return denominator / divisor
}
