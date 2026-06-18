"use client"

import { useEffect, useState, useRef } from "react"
import { collection, onSnapshot, doc, setDoc, increment, serverTimestamp, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { normalizeStatus } from "@/lib/validation"

export interface Candidate {
  id: string
  NamaCalonFormatur: string
  FotoCalonFormatur: string
  JumlahVote?: number
}

const ROLE_OPTIONS = [
  { key: "ketuaUmum", label: "Ketua Umum" },
  { key: "sekretarisUmum", label: "Sekretaris Umum" },
  { key: "bendaharaUmum", label: "Bendahara Umum" },
  { key: "ketuaOrganisasi", label: "Ketua Bidang Perkaderan" },
  { key: "ketuaPerkaderan", label: "Ketua Bidang PIP" },
  { key: "ketuaKDI", label: "Ketua Bidang KDI" },
  { key: "ketuaASBO", label: "Ketua Bidang ASBO" },
]

const COLORS = ["#16a34a", "#15803d", "#14532d", "#22c55e", "#86efac"]

const DEFAULT_LANDING = {
  winnerTitle: "Struktur Inti",
  winnerSubtitle: "Terima kasih atas partisipasi Anda",
  winnerHeadingColor: "#14532d",
  winnerHeadingSize: "2.5",
  winnerSubColor: "#166534",
  winnerSubSize: "1",
  totalLabel: "Total Peserta",
  totalSub: "Terdaftar dalam DPT",
  votedLabel: "Sudah Memilih",
  notVotedLabel: "Belum Memilih",
  notVotedSuffix: "Peserta",
  candidateSectionTitle: "Calon Formatur IPM 2025",
  candidateSectionTitleColor: "#1f2937",
  candidateSectionTitleSize: "1.5",
  candidateSubtitle: "Calon Kandidat Formatur",
  candidateSubtitleColor: "#6b7280",
  candidateSubtitleSize: "0.9",
  candidateBadgePrefix: "Calon",
  candidateBadgeBgColor: "#16a34a",
  candidateBadgeTextColor: "#ffffff",
  candidateBadgeFontSize: "1.1",
  candidateBadgeShape: "rounded",
  candidateBadgeTextTransform: "none",
  candidateBadgeShadow: true,
  chartTitle: "Perolehan Suara Sementara",
  chartTitleColor: "#1f2937",
  chartTitleSize: "1.5",
  chartTitleSizeMobile: "1.3",
  chartYAxisLabel: "Jumlah Suara",
  loginLinkText: "LOGIN PANITIA / ADMIN",
  footerMadeBy: "Dibuat dengan 🤍 oleh Muhammad Abid",
  footerCopyright: "© 2026 Musyda IPM Kutim. All rights reserved.",
  structureGroupTitleColor: "#0f172a",
  structureGroupTitleSize: "1.05",
  structureBackboneColor: "#e5e7eb",
  structureGroupIntiTitle: "Inti",
  structureGroupBidangTitle: "Ketua Bidang",
  winnerHeadingSizeMobile: "2.2",
  winnerSubSizeMobile: "0.9",
  candidateSectionTitleSizeMobile: "1.3",
  candidateSubtitleSizeMobile: "0.85",
}

function labelToKey(label: string): string | undefined {
  if (!label) return undefined
  const normalized = label.trim().toLowerCase()
  const found = ROLE_OPTIONS.find((r) => r.label.toLowerCase() === normalized)
  return found?.key
}

export function useLandingPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [totalSudah, setTotalSudah] = useState(0)
  const [totalBelum, setTotalBelum] = useState(0)
  const [landingContent, setLandingContent] = useState(DEFAULT_LANDING)
  const [landingStatus, setLandingStatus] = useState({ utama: true, winner: false })
  const [rolesMap, setRolesMap] = useState<Record<string, string>>({
    ketuaUmum: "", sekretarisUmum: "", bendaharaUmum: "", ketuaOrganisasi: "",
    ketuaPerkaderan: "", ketuaKDI: "", ketuaASBO: "",
  })
  const [roleLabels, setRoleLabels] = useState<Record<string, string>>(
    ROLE_OPTIONS.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.label }), {}),
  )
  const [isMobileView, setIsMobileView] = useState(false)
  const hasCountedView = useRef(false)
  const roleLabelsRef = useRef(roleLabels)

  useEffect(() => { roleLabelsRef.current = roleLabels }, [roleLabels])

  useEffect(() => {
    const check = () => setIsMobileView(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const applyLandingSettings = (data: any) => {
    if (!data) return
    const utamaData = data.utama || data.Utama || {}
    const winnerData = data.winner || data.FormaturTerpilih || {}
    setLandingStatus({
      utama: normalizeStatus(utamaData.Status ?? utamaData.status ?? utamaData, true),
      winner: normalizeStatus(winnerData.Status ?? winnerData.status ?? winnerData, false),
    })
    const rolesData = winnerData.Roles || winnerData.roles
    if (rolesData) setRolesMap((prev) => ({ ...prev, ...rolesData }))
    const labelsData = winnerData.RoleLabels || winnerData.roleLabels
    if (labelsData) setRoleLabels((prev) => ({ ...prev, ...labelsData }))
  }

  const landingSettingsRef = doc(db, "LandingPage", "settings")

  useEffect(() => {
    let triedLegacySettings = false
    const loadLegacySettings = async () => {
      if (triedLegacySettings) return
      triedLegacySettings = true
      try {
        const [utamaSnap, winnerSnap] = await Promise.all([
          getDoc(doc(db, "LandingPage", "Utama")),
          getDoc(doc(db, "LandingPage", "FormaturTerpilih")),
        ])
        const legacyData = {
          utama: utamaSnap.exists() ? utamaSnap.data() : undefined,
          winner: winnerSnap.exists() ? winnerSnap.data() : undefined,
        }
        applyLandingSettings(legacyData)
        const payload: Record<string, any> = {}
        if (legacyData.utama) payload.utama = legacyData.utama
        if (legacyData.winner) payload.winner = legacyData.winner
        if (Object.keys(payload).length) await setDoc(landingSettingsRef, payload, { merge: true })
      } catch (error) {
        console.error("Gagal memuat status landing legacy", error)
      }
    }

    const unsubCandidates = onSnapshot(collection(db, "Data_Calon_Formatur"), (snapshot) => {
      const cands: Candidate[] = []
      snapshot.forEach((doc) => { cands.push({ id: doc.id, ...doc.data() } as Candidate) })
      cands.sort((a, b) => a.id.localeCompare(b.id))
      setCandidates(cands)
    })
    const unsubLanding = onSnapshot(doc(db, "LandingContent", "main"), (snap) => {
      if (snap.exists()) setLandingContent((prev) => ({ ...prev, ...snap.data() }))
    })
    const unsubSettings = onSnapshot(landingSettingsRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        applyLandingSettings(data)
        const hasStatus = Boolean(data?.utama || data?.Utama || data?.winner || data?.FormaturTerpilih)
        if (!hasStatus) loadLegacySettings()
      } else {
        loadLegacySettings()
      }
    })
    const unsubJabatan = onSnapshot(collection(db, "JabatanFormatur"), (snap) => {
      const incoming: Record<string, string> = {}
      snap.forEach((d) => { const key = labelToKey(d.data()?.Jabatan || ""); if (key) incoming[key] = d.id })
      if (Object.keys(incoming).length) setRolesMap((prev) => ({ ...prev, ...incoming }))
    })
    const unsubPeserta = onSnapshot(collection(db, "Data_Peserta"), (snap) => {
      let sudah = 0, belum = 0
      snap.forEach((d) => { (d.data()?.StatusVoting || "").toLowerCase() === "sudah" ? sudah++ : belum++ })
      setTotalSudah(sudah)
      setTotalBelum(belum)
    })

    return () => { unsubCandidates(); unsubLanding(); unsubSettings(); unsubJabatan(); unsubPeserta() }
  }, [])

  useEffect(() => {
    if (hasCountedView.current) return
    setDoc(landingSettingsRef, { views: { Jumlah: increment(1), lastView: serverTimestamp() } }, { merge: true })
    hasCountedView.current = true
  }, [])

  const totalPeserta = totalSudah + totalBelum
  const percentage = totalPeserta > 0 ? ((totalSudah / totalPeserta) * 100).toFixed(1) : "0"
  const showLanding = landingStatus.utama !== false
  const showWinner = landingStatus.winner === true

  const chartData = candidates.map((c) => ({
    name: `${landingContent.candidateBadgePrefix || "Calon"} ${c.id}`,
    fullName: c.NamaCalonFormatur,
    votes: c.JumlahVote || 0,
  }))

  const sizeByDevice = (desktopKey: string, mobileKey: string) => {
    const mobileVal = (landingContent as any)[mobileKey]
    const desktopVal = (landingContent as any)[desktopKey]
    if (isMobileView && mobileVal) return Number(mobileVal) || 0
    return Number(desktopVal) || 0
  }

  const roleList = ROLE_OPTIONS.map((role) => ({
    ...role,
    label: roleLabels[role.key] || role.label,
  }))

  return {
    candidates,
    totalPeserta,
    totalSudah,
    totalBelum,
    percentage,
    landingContent,
    landingStatus,
    rolesMap,
    roleLabels,
    isMobileView,
    showLanding,
    showWinner,
    chartData,
    roleList,
    sizeByDevice,
    ROLE_OPTIONS,
    COLORS,
  }
}
