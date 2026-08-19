"use client"

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
    showResults,
    showWinner,
    chartData,
    roleList,
    rolesMap,
    roleLabels,
    isMobileView,
    sizeByDevice,
    COLORS,
  } = useLandingPage()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 px-4 sm:px-6 lg:px-10 max-w-6xl mx-auto">
      <HeroStats
        landingContent={landingContent}
        totalPeserta={totalPeserta}
        totalSudah={totalSudah}
        totalBelum={totalBelum}
        percentage={percentage}
      />

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

      <CandidatesGrid
        candidates={candidates}
        landingContent={landingContent}
        sizeByDevice={sizeByDevice}
        showResults={showResults}
      />

      {showResults && (
        <ChartSection
          chartData={chartData}
          landingContent={landingContent}
          sizeByDevice={sizeByDevice}
          colors={COLORS}
        />
      )}

      <div className="flex justify-center gap-4 pt-8">
        <Link
          href="/login"
          className="text-sm text-gray-500 hover:text-green-600 underline border-background border-solid border-0 font-semibold"
        >
          {landingContent.loginLinkText}
        </Link>
      </div>
    </div>
  )
}
