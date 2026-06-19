"use client"

import { Scanner } from "@yudiel/react-qr-scanner"
import { Camera } from "lucide-react"

interface ScannerSectionProps {
  isScanning: boolean
  onDecode: (text: string) => void
  onError: (error: unknown) => void
}

export default function ScannerSection({ isScanning, onDecode, onError }: ScannerSectionProps) {
  if (isScanning) {
    return (
      <Scanner
        key="active-scanner"
        onScan={(detectedCodes) => {
          if (detectedCodes.length > 0) {
            onDecode(detectedCodes[0].rawValue)
          }
        }}
        onError={(error) => {
          if (error) onError(error)
        }}
        constraints={{
          audio: false,
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        }}
        scanDelay={400}
        containerStyle={{ width: "100%", height: "16rem", backgroundColor: "#000" }}
        videoStyle={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    )
  }

  return (
    <div className="h-64 flex flex-col items-center justify-center bg-gray-100 text-gray-500 border-2 border-dashed border-gray-300 m-2 rounded-lg">
      <Camera className="w-12 h-12 mb-2 opacity-50" />
      <p>Kamera tidak aktif</p>
      <p className="text-xs mt-1">Klik &quot;Buka Kamera&quot; untuk memulai</p>
    </div>
  )
}
