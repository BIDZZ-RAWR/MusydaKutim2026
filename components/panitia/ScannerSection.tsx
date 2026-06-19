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

const CONTAINER_ID = "panitia-qr-scanner"

const ScannerSection = forwardRef<ScannerSectionHandle, ScannerSectionProps>(
  ({ onDecode, onError, onLoadingChange }, ref) => {
    const scannerRef = useRef<Html5Qrcode | null>(null)
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

      if (typeof navigator === "undefined" || !navigator.mediaDevices) {
        onError(new Error("Browser tidak mendukung akses kamera"))
        return
      }

      setLoading(true)
      onLoadingChange?.(true)

      try {
        const scanner = new Html5Qrcode(CONTAINER_ID, {
          verbose: false,
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        })
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
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
    }, [onDecode, onError, onLoadingChange])

    useEffect(() => {
      return () => {
        if (scannerRef.current) {
          scannerRef.current.stop().catch(() => {})
          scannerRef.current = null
        }
      }
    }, [])

    return (
      <div className="relative w-full overflow-hidden rounded-lg" style={{ minHeight: "16rem" }}>
        <div id={CONTAINER_ID} className="w-full h-full" />

        {!cameraActive && !loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-100 p-4 text-gray-500">
            <Camera className="mb-2 h-12 w-12 opacity-50" />
            <p>Kamera tidak aktif</p>
            <p className="mt-1 text-xs">Klik &quot;Buka Kamera&quot; untuk memulai</p>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black p-4 text-gray-500">
            <Loader2 className="mb-2 h-8 w-8 animate-spin text-white" />
            <p className="text-sm text-white">Mengakses kamera...</p>
          </div>
        )}
      </div>
    )
  },
)

ScannerSection.displayName = "ScannerSection"

export default ScannerSection
