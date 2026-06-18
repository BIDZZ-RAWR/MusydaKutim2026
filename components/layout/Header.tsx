import Image from "next/image"

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center gap-4">
        <div className="relative h-14 w-28 shrink-0">
          <Image
            src="/images/logo.png"
            alt="Logo IPM"
            fill
            className="object-contain"
          />
        </div>
        <div>
          <h1 className="text-lg md:text-l font-bold text-green-700 leading-tight">
            Pimpinan Daerah Ikatan Pelajar Muhammadiyah
          </h1>
          <p className="text-md text-gray-600 font-medium">Kutai Timur</p>
        </div>
      </div>
    </header>
  )
}
