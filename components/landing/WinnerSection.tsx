"use client"

import { useState } from "react"
import WinnerCard from "./WinnerCard"
import MobileRoleList from "./MobileRoleList"
import MobileSheet from "./MobileSheet"

interface WinnerSectionProps {
  landingContent: any
  rolesMap: Record<string, string>
  roleLabels: Record<string, string>
  candidates: { id: string; NamaCalonFormatur: string; FotoCalonFormatur?: string; JumlahVote?: number }[]
  roleList: { key: string; label: string }[]
  isMobileView: boolean
  sizeByDevice: (desktopKey: string, mobileKey: string) => number
}

export default function WinnerSection({
  landingContent,
  rolesMap,
  roleLabels,
  candidates,
  roleList,
  isMobileView,
  sizeByDevice,
}: WinnerSectionProps) {
  const [sheetData, setSheetData] = useState<null | { role: string; name: string; meta: string; photo?: string }>(null)
  const candidateById = (id: string) => candidates.find((c) => c.id === id)

  const groups = [
    {
      title: landingContent.structureGroupIntiTitle || "Inti",
      keys: ["ketuaUmum", "sekretarisUmum", "bendaharaUmum"],
      meta: "Formatur Inti",
    },
    {
      title: landingContent.structureGroupBidangTitle || "Ketua Bidang",
      keys: ["ketuaOrganisasi", "ketuaPerkaderan", "ketuaKDI", "ketuaASBO"],
      meta: "Formatur Bidang",
    },
  ]

  return (
    <section className="space-y-6 bg-gradient-to-br from-green-50 via-white to-green-100 p-8 rounded-3xl shadow-lg border border-green-100">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Formatur Terpilih</p>
        <h1
          className="font-extrabold leading-tight"
          style={{
            color: landingContent.winnerHeadingColor,
            fontSize: `${sizeByDevice("winnerHeadingSize", "winnerHeadingSizeMobile") || 0}rem`,
          }}
        >
          {landingContent.winnerTitle}
        </h1>
        <p
          className="leading-relaxed"
          style={{
            color: landingContent.winnerSubColor,
            fontSize: `${sizeByDevice("winnerSubSize", "winnerSubSizeMobile") || 0}rem`,
          }}
        >
          {landingContent.winnerSubtitle}
        </p>
      </div>

      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roleList.map((role) => {
          const selectedId = rolesMap[role.key]
          const candidate = selectedId ? candidateById(selectedId) : null
          return <WinnerCard key={role.key} role={role} candidate={candidate} />
        })}
      </div>

      <MobileRoleList
        groups={groups}
        roleList={roleList}
        rolesMap={rolesMap}
        candidates={candidates}
        landingContent={landingContent}
        onSheetOpen={setSheetData}
      />

      <MobileSheet data={sheetData} onClose={() => setSheetData(null)} />
    </section>
  )
}
