interface VoterHeaderProps {
  voterName: string
  selectedCount: number
}

export default function VoterHeader({ voterName, selectedCount }: VoterHeaderProps) {
  return (
    <header className="mb-8 text-center animate-in slide-in-from-top duration-700">
      <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">Halo, {voterName}</h1>
      <p className="text-sm sm:text-lg text-gray-600">
        Pilih tepat <span className="font-semibold text-green-700">9</span> calon formatur di bawah ini.
      </p>
      <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">
        Dipilih: {selectedCount} / 9
      </div>
    </header>
  )
}
