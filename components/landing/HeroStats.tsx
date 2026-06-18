import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface HeroStatsProps {
  landingContent: any
  totalPeserta: number
  totalSudah: number
  totalBelum: number
  percentage: string
}

export default function HeroStats({ landingContent, totalPeserta, totalSudah, totalBelum, percentage }: HeroStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 px-0 mx-0 shadow">
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-600">{landingContent.totalLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-900">{totalPeserta}</div>
          <p className="text-xs text-blue-600 mt-1">{landingContent.totalSub}</p>
        </CardContent>
      </Card>
      <Card className="bg-green-50 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-600">{landingContent.votedLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-900">{totalSudah}</div>
          <p className="text-xs text-green-600 mt-1">{percentage}% Partisipasi</p>
        </CardContent>
      </Card>
      <Card className="bg-orange-50 border-orange-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-orange-600">{landingContent.notVotedLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-900">{totalBelum}</div>
          <p className="text-xs text-orange-600 mt-1">{landingContent.notVotedSuffix}</p>
        </CardContent>
      </Card>
    </div>
  )
}
