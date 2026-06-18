import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

interface CandidateCardProps {
  candidate: { id: string; NamaCalonFormatur: string; FotoCalonFormatur: string }
  isSelected: boolean
  orderNumber: number
  onToggle: () => void
  index: number
}

export default function CandidateCard({ candidate, isSelected, orderNumber, onToggle, index }: CandidateCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all duration-300 transform animate-in slide-in-from-bottom-4 ${
        isSelected
          ? "ring-4 ring-green-500 shadow-2xl scale-105 -translate-y-2 bg-green-50"
          : "hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]"
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={onToggle}
    >
      <div className="aspect-[3/4] relative bg-gray-200 overflow-hidden rounded-t-lg">
        {candidate.FotoCalonFormatur ? (
          <Image
            src={candidate.FotoCalonFormatur || "/placeholder.svg"}
            alt={candidate.NamaCalonFormatur}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
        )}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-4 py-2 rounded-full font-bold text-xl shadow-lg border-2 border-green-500">
          {candidate.id}
        </div>
        {isSelected && (
          <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-full p-4 shadow-xl">
              <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center text-xl font-bold">
                {orderNumber}
              </div>
            </div>
          </div>
        )}
      </div>
      <CardContent className="p-3 sm:p-4 text-center bg-white">
        <h3 className="font-bold text-base sm:text-xl text-gray-900">{candidate.NamaCalonFormatur}</h3>
        <p className="text-xs sm:text-sm text-gray-500">Calon Formatur</p>
      </CardContent>
    </Card>
  )
}
