import { toast } from "sonner"
import type { z } from "zod"

export function validate<T>(schema: z.ZodSchema<T>, data: unknown, fallback = "Data tidak valid"): T | null {
  const result = schema.safeParse(data)
  if (!result.success) {
    toast.error(result.error.errors.map((e) => e.message).join("\n"))
    return null
  }
  return result.data as T
}

export function parseWithFeedback<T>(schema: z.ZodSchema<T>, payload: unknown, fallbackMessage = "Data tidak valid") {
  const result = schema.safeParse(payload)
  if (!result.success) {
    return null
  }
  return result.data
}

export function normalizeStatus(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value
  if (typeof value === "string") return value.toLowerCase() === "true" || value === "1" || value === "on"
  if (value === undefined || value === null) return fallback
  return Boolean(value)
}
