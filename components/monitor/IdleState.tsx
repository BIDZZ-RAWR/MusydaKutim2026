import Image from "next/image"
import { Toaster } from "@/components/ui/toaster"

interface IdleStateProps {
  bilikId: string
}

export default function IdleState({ bilikId }: IdleStateProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 text-white animate-in fade-in duration-700">
      <Toaster />
      <div className="animate-pulse mb-8">
        <div className="h-48 w-48 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-2xl p-4">
          <Image
            src="/images/logo.png"
            alt="Logo IPM"
            width={150}
            height={150}
            className="object-contain drop-shadow-lg"
          />
        </div>
      </div>
      <h1 className="text-5xl font-bold mb-4 text-center">BILIK SUARA {bilikId}</h1>
      <p className="text-2xl text-green-300 animate-pulse">Menunggu Panitia Scan QR Code...</p>
      <div className="mt-8 text-sm text-gray-400">Monitor Aktif &bull; Musyda IPM Kutai Timur</div>
    </div>
  )
}
