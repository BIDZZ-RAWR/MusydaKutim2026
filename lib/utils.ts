import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimestamp(ts: { seconds?: number; nanoseconds?: number; toDate?: () => Date } | undefined | null): string {
  if (!ts) return ""
  const ms = typeof ts === "object" && "seconds" in ts ? Number(ts.seconds) * 1000 : Number(ts)
  return Number.isNaN(ms) ? "" : new Date(ms).toLocaleString("id-ID")
}

export function sanitizeText(value: string, maxLength = 120) {
  return value
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength)
}

