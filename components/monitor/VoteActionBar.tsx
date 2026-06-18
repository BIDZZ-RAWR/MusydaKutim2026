"use client"

import { Button } from "@/components/ui/button"

interface VoteActionBarProps {
  disabled: boolean
  isSubmitting: boolean
  onSubmit: () => void
}

export default function VoteActionBar({ disabled, isSubmitting, onSubmit }: VoteActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-white/95 backdrop-blur border-t shadow-2xl flex justify-center animate-in slide-in-from-bottom duration-500">
      <Button
        size="lg"
        className="w-full max-w-md text-base sm:text-lg h-12 sm:h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg transition-all duration-300 hover:shadow-xl disabled:opacity-50"
        disabled={disabled}
        onClick={onSubmit}
      >
        {isSubmitting ? "Menyimpan Suara..." : "\u2713 SIMPAN 9 PILIHAN SAYA"}
      </Button>
    </div>
  )
}
