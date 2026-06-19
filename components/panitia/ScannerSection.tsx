"use client"

import { Scanner } from "@yudiel/react-qr-scanner"
import { Camera } from "lucide-react"

interface ScannerSectionProps {
  scanMode: boolean
  onDecode: (text: string) => void
  onError: (error: unknown) => void
}

export default function ScannerSection({ scanMode, onDecode, onError }: ScannerSectionProps) {
  return (
    <Scanner
      paused={!scanMode}
      onScan={(detectedCodes) => {
        if (detectedCodes.length > 0) {
          onDecode(detectedCodes[0].rawValue)
        }
      }}
      onError={(error) => {
        if (error) onError(error)
      }}
      formats={["qr_code"]}
      constraints={{
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { min: 480, ideal: 720 },
          height: { min: 480, ideal: 720 },
        },
      }}
      scanDelay={300}
      containerStyle={{
        width: "100%",
        height: "16rem",
        backgroundColor: scanMode ? "#000" : "#f3f4f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      videoStyle={{ width: "100%", height: "100%", objectFit: "cover" }}
    >
      {!scanMode && (
        <div className="flex flex-col items-center justify-center text-gray-500">
          <Camera className="w-12 h-12 mb-2 opacity-50" />
          <p>Kamera tidak aktif</p>
          <p className="text-xs mt-1">Klik &quot;Buka Kamera&quot; untuk memulai</p>
        </div>
      )}
    </Scanner>
  )
}
