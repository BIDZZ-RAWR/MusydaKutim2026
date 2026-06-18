"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ManualInputProps {
  value: string
  onChange: (value: string) => void
  onProcess: () => void
  disabled: boolean
}

export default function ManualInput({ value, onChange, onProcess, disabled }: ManualInputProps) {
  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Atau Input Manual</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Input NIB Secara Manual"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-center font-mono"
        />
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={onProcess}
          disabled={!value || disabled}
        >
          Proses
        </Button>
      </div>
    </>
  )
}
