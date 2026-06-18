import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

interface WinnerCardProps {
  role: { key: string; label: string }
  candidate: { id: string; NamaCalonFormatur: string; FotoCalonFormatur?: string } | undefined
}

export default function WinnerCard({ role, candidate }: WinnerCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-gray-600">{role.label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="aspect-[3/4] w-full rounded-lg overflow-hidden bg-gray-100 border">
          {candidate?.FotoCalonFormatur ? (
            <Image
              src={candidate.FotoCalonFormatur}
              alt={candidate.NamaCalonFormatur}
              width={300}
              height={400}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              Tidak ada foto
            </div>
          )}
        </div>
        <div>
          <div className="text-lg font-bold text-gray-900">
            {candidate ? candidate.NamaCalonFormatur : "Belum diatur"}
          </div>
          <div className="text-xs text-gray-500">ID: {candidate?.id || "-"}</div>
        </div>
      </CardContent>
    </Card>
  )
}
