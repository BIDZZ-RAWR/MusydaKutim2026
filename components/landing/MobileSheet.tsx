import Image from "next/image"

interface MobileSheetProps {
  data: { role: string; name: string; meta: string; photo?: string } | null
  onClose: () => void
}

export default function MobileSheet({ data, onClose }: MobileSheetProps) {
  if (!data) return null

  return (
    <div className="md:hidden fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white shadow-2xl p-5 space-y-3">
        <div className="w-12 h-1 rounded-full bg-gray-200 mx-auto" aria-hidden />
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-lg bg-gray-100 overflow-hidden shrink-0"
            style={{
              width: "clamp(46px,12vw,54px)",
              height: "clamp(62px,16vw,72px)",
              aspectRatio: "3 / 4",
            }}
          >
            {data.photo ? (
              <Image src={data.photo} alt={data.name} width={80} height={106} className="h-full w-full object-cover" />
            ) : (
              <div className="text-[11px] font-semibold text-gray-500 leading-tight text-center">
                Foto<br />3x4
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[clamp(14.5px,3.8vw,16px)] font-black text-gray-900 leading-tight">{data.role}</div>
            <div className="text-[clamp(13px,3.4vw,14px)] font-semibold text-gray-800">{data.name}</div>
            <div className="text-[clamp(11px,3vw,12px)] font-semibold text-gray-500">{data.meta}</div>
          </div>
          <button
            className="p-2 rounded-full text-gray-500 hover:text-gray-700"
            onClick={onClose}
            aria-label="Tutup detail"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
