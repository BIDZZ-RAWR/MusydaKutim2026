"use client"

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle, useState } from "react"
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode"
import { Camera, Loader2 } from "lucide-react"

export interface ScannerSectionHandle {
  startCamera: () => Promise<void>
  stopCamera: () => Promise<void>
}

interface ScannerSectionProps {
  onDecode: (text: string) => void
  onError: (error: unknown) => void
  onLoadingChange?: (loading: boolean) => void
}

const ScannerSection = forwardRef<ScannerSectionHandle, ScannerSectionProps>(
  ({ onDecode, onError, onLoadingChange }, ref) => {
    const scannerRef = useRef<Html5Qrcode | null>(null)
    const containerId = useRef(`qr-scanner-${Math.random().toString(36).slice(2, 8)}`).current
    const [cameraActive, setCameraActive] = useState(false)
    const [loading, setLoading] = useState(false)

    useImperativeHandle(ref, () => ({
      startCamera,
      stopCamera,
    }))

    const stopCamera = useCallback(async () => {
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop()
        } catch {}
        scannerRef.current = null
      }
      setCameraActive(false)
      setLoading(false)
      onLoadingChange?.(false)
    }, [onLoadingChange])

    const startCamera = useCallback(async () => {
      if (scannerRef.current) return

      setLoading(true)
      onLoadingChange?.(true)

      try {
        const scanner = new Html5Qrcode(containerId)
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          },
          (decodedText) => {
            onDecode(decodedText)
          },
          () => {},
        )

        setCameraActive(true)
        setLoading(false)
        onLoadingChange?.(false)
      } catch (err) {
        scannerRef.current = null
        setCameraActive(false)
        setLoading(false)
        onLoadingChange?.(false)
        onError(err)
      }
    }, [containerId, onDecode, onError, onLoadingChange])

    useEffect(() => {
      return () => {
        if (scannerRef.current) {
          scannerRef.current.stop().catch(() => {})
          scannerRef.current = null
        }
      }
    }, [])

    return (
      <div
        id={containerId}
        style={{
          width: "100%",
          minHeight: "16rem",
          backgroundColor: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        className="overflow-hidden rounded-lg relative"
      >
        {!cameraActive && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 p-4 bg-gray-100 z-10">
            <Camera className="w-12 h-12 mb-2 opacity-50" />
            <p>Kamera tidak aktif</p>
            <p className="text-xs mt-1">Klik &quot;Buka Kamera&quot; untuk memulai</p>
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 p-4 bg-black z-10">
            <Loader2 className="w-8 h-8 mb-2 animate-spin text-white" />
            <p className="text-white text-sm">Mengakses kamera...</p>
          </div>
        )}
      </div>
    )
  },
)

ScannerSection.displayName = "ScannerSection"

export default ScannerSection
