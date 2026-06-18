"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { SummaryCards } from "./SummaryCards"
import { EmptyState } from "./EmptyState"
import { BarChart3 } from "lucide-react"
import type { Candidate, ViewStats, EditHistory } from "../types"
import { formatTimestamp } from "@/lib/utils"

interface OverviewTabProps {
  panitiaCount: number
  pesertaTotalCount: number
  candidateCount: number
  candidateList: Candidate[]
  viewStats: ViewStats
  editHistory: EditHistory
  showFullHistory: boolean
  setShowFullHistory: React.Dispatch<React.SetStateAction<boolean>>
}

const CHART_COLORS = [
  "oklch(0.55 0.13 165)",
  "oklch(0.6 0.12 145)",
  "oklch(0.5 0.15 155)",
  "oklch(0.65 0.1 170)",
  "oklch(0.7 0.08 150)",
  "oklch(0.58 0.14 160)",
]

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-stone-200 shadow-lg rounded-xl px-4 py-3 text-sm">
      <p className="font-semibold text-stone-800">{label}</p>
      <p className="text-emerald-700 font-mono font-medium">
        {payload[0].value} suara
      </p>
    </div>
  )
}

export function OverviewTab({
  panitiaCount,
  pesertaTotalCount,
  candidateCount,
  candidateList,
  viewStats,
  editHistory,
  showFullHistory,
  setShowFullHistory,
}: OverviewTabProps) {
  const totalVotes = candidateList.reduce((sum, c) => sum + Number(c.JumlahVote || 0), 0)
  const chartData = candidateList
    .map((c) => ({
      id: c.id,
      name: c.NamaCalonFormatur || c.id,
      votes: Number(c.JumlahVote || 0),
    }))
    .sort((a, b) => b.votes - a.votes)

  const historyText = editHistory.ApaYangDiEdit || "Belum ada catatan"
  const isLongHistory = historyText.length > 160
  const displayHistory = isLongHistory && !showFullHistory ? `${historyText.slice(0, 160)}...` : historyText

  return (
    <div className="space-y-6 animate-fade-in">
      <SummaryCards
        panitiaCount={panitiaCount}
        pesertaCount={pesertaTotalCount}
        candidateCount={candidateCount}
        viewCount={viewStats?.Jumlah || 0}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 border-stone-200 shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4">
            <div>
              <CardTitle className="text-stone-800 text-lg">Perolehan Suara</CardTitle>
              <CardDescription>Grafik perolehan suara kandidat formatur</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-stone-500">Total Suara</p>
                <p className="text-lg font-bold text-stone-800 tabular-nums">{totalVotes.toLocaleString()}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="Belum ada data suara"
                description="Data perolehan suara akan muncul setelah kandidat ditambahkan."
              />
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barCategoryGap="20%" margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "oklch(0.556 0 0)" }}
                      axisLine={{ stroke: "oklch(0.922 0 0)" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "oklch(0.556 0 0)" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "oklch(0.97 0 0)" }} />
                    <Bar dataKey="votes" radius={[6, 6, 0, 0]} animationDuration={800} animationBegin={100}>
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-stone-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-stone-800 text-lg">Riwayat Edit</CardTitle>
            <CardDescription>Perubahan terakhir landing page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-stone-500">Akun:</span>
              <span className="font-semibold text-stone-800">{editHistory.akun || "-"}</span>
            </div>
            <div className="relative pl-4 border-l-2 border-emerald-200">
              <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
              <div className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">{displayHistory}</div>
            </div>
            {isLongHistory && (
              <Button
                variant="ghost"
                size="sm"
                className="px-0 text-emerald-700 hover:text-emerald-800 h-auto"
                onClick={() => setShowFullHistory(!showFullHistory)}
              >
                {showFullHistory ? "Tampilkan lebih sedikit" : "Selengkapnya"}
              </Button>
            )}
            <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-stone-300" />
              {formatTimestamp(editHistory.timestamp) || "Belum ada timestamp"}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
