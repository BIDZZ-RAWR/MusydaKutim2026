"use client"

import { usePanitiaDashboard } from "@/components/panitia/hooks/usePanitiaDashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"
import ScannerSection from "@/components/panitia/ScannerSection"
import CameraControls from "@/components/panitia/CameraControls"
import ManualInput from "@/components/panitia/ManualInput"
import StatusMessage from "@/components/panitia/StatusMessage"
import MonitorStatus from "@/components/panitia/MonitorStatus"

export default function PanitiaDashboard() {
  const {
    panitiaId,
    router,
    scanResult, setScanResult,
    status,
    message,
    monitorConnected,
    lastHeartbeat,
    isScanning,
    startScanner,
    stopScanner,
    handleScannerError,
    handleProcessParticipant,
  } = usePanitiaDashboard()

  return (
    <div className="max-w-md mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Panitia {panitiaId}</h1>
        <Button
          variant="outline"
          onClick={() => router.push("/darurat")}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          Mode Darurat - Emergency
        </Button>
      </div>

      <Card
        className={`transition-all duration-300 ${status === "success" ? "border-green-500 bg-green-50 shadow-lg scale-[1.02]" : "shadow-md"}`}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Scan Kartu Peserta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-hidden rounded-lg bg-black">
            <ScannerSection
              isScanning={isScanning}
              onDecode={(text) => {
                setScanResult(text)
                handleProcessParticipant(text)
              }}
              onError={handleScannerError}
            />
          </div>

          <CameraControls
            isScanning={isScanning}
            onStart={startScanner}
            onStop={stopScanner}
          />

          <ManualInput
            value={scanResult}
            onChange={setScanResult}
            onProcess={() => handleProcessParticipant(scanResult)}
            disabled={status === "processing" || !monitorConnected}
          />

          <StatusMessage status={status} message={message} />
        </CardContent>
      </Card>

      <MonitorStatus
        panitiaId={panitiaId}
        monitorConnected={monitorConnected}
        lastHeartbeat={lastHeartbeat}
      />
    </div>
  )
}
