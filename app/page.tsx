"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import WinnerSection from "@/components/landing/WinnerSection"
import HeroStats from "@/components/landing/HeroStats"
import CandidatesGrid from "@/components/landing/CandidatesGrid"
import ChartSection from "@/components/landing/ChartSection"
import { useLandingPage } from "@/app/hooks/useLandingPage"

export default function LandingPage() {
  const {
    candidates,
    totalPeserta,
    totalSudah,
    totalBelum,
    percentage,
    landingContent,
    showLanding,
    showWinner,
    chartData,
    roleList,
    rolesMap,
    roleLabels,
    isMobileView,
    sizeByDevice,
    COLORS,
  } = useLandingPage()

  if (!showLanding && !showWinner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-700">
        <Card className="p-6 shadow-lg">
          <CardTitle>Halaman dinonaktifkan</CardTitle>
          <p className="text-sm text-gray-500 mt-2">Landing page dimatikan oleh admin.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 px-4 sm:px-6 lg:px-10 max-w-6xl mx-auto">
      {showWinner && (
        <WinnerSection
          landingContent={landingContent}
          rolesMap={rolesMap}
          roleLabels={roleLabels}
          candidates={candidates}
          roleList={roleList}
          isMobileView={isMobileView}
          sizeByDevice={sizeByDevice}
        />
      )}

      {showLanding && (
        <>
          <HeroStats
            landingContent={landingContent}
            totalPeserta={totalPeserta}
            totalSudah={totalSudah}
            totalBelum={totalBelum}
            percentage={percentage}
          />

          <CandidatesGrid
            candidates={candidates}
            landingContent={landingContent}
            sizeByDevice={sizeByDevice}
          />

          <ChartSection
            chartData={chartData}
            landingContent={landingContent}
            sizeByDevice={sizeByDevice}
            colors={COLORS}
          />

          <div className="flex justify-center gap-4 pt-8">
            <Link
              href="/login"
              className="text-sm text-gray-500 hover:text-green-600 underline border-background border-solid border-0 font-semibold"
            >
              {landingContent.loginLinkText}
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
