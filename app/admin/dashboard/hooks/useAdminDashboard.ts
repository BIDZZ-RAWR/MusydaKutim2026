"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import {
  collection,
  getDocs,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  startAfter,
  limit,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Panitia, Peserta, Candidate, Bilik, LandingContent, LandingStatus, RolesMap, RoleLabels, ViewStats, EditHistory } from "../types"
import {
  ROLE_OPTIONS, PESERTA_PAGE_SIZE, DEFAULT_LANDING_CONTENT, DEFAULT_LANDING_STATUS,
  labelToKey, landingContentSchema, parseWithFeedback,
} from "../constants"
import { sanitizeText } from "@/lib/utils"
import { apiPost } from "@/lib/api-client"

const landingSettingsRef = doc(db, "LandingPage", "settings")

export function useAdminDashboard() {
  const [panitiaList, setPanitiaList] = useState<Panitia[]>([])
  const [pesertaList, setPesertaList] = useState<Peserta[]>([])
  const [candidateList, setCandidateList] = useState<Candidate[]>([])
  const [bilikList, setBilikList] = useState<Bilik[]>([])
  const [pesertaLoading, setPesertaLoading] = useState(false)
  const [pesertaHasMore, setPesertaHasMore] = useState(true)
  const [pesertaTotalCount, setPesertaTotalCount] = useState(0)
  const [landingContent, setLandingContent] = useState<LandingContent>(DEFAULT_LANDING_CONTENT as LandingContent)
  const [landingStatus, setLandingStatus] = useState<LandingStatus>(DEFAULT_LANDING_STATUS)
  const [rolesMap, setRolesMap] = useState<RolesMap>({
    ketuaUmum: "", sekretarisUmum: "", bendaharaUmum: "", ketuaOrganisasi: "",
    ketuaPerkaderan: "", ketuaKDI: "", ketuaASBO: "",
  })
  const [roleLabels, setRoleLabels] = useState<RoleLabels>(
    ROLE_OPTIONS.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.label }), {}),
  )
  const [prevLandingContent, setPrevLandingContent] = useState<LandingContent>(DEFAULT_LANDING_CONTENT as LandingContent)
  const [prevLandingStatus, setPrevLandingStatus] = useState<LandingStatus>(DEFAULT_LANDING_STATUS)
  const [prevRolesMap, setPrevRolesMap] = useState<RolesMap>({})
  const [prevRoleLabels, setPrevRoleLabels] = useState<RoleLabels>({})
  const [viewStats, setViewStats] = useState<ViewStats>({ Jumlah: 0 })
  const [editHistory, setEditHistory] = useState<EditHistory>({})
  const [adminEmail, setAdminEmail] = useState("admin")
  const [savingLanding, setSavingLanding] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showFullHistory, setShowFullHistory] = useState(false)
  const pesertaCursorRef = useRef<any>(null)

  useEffect(() => {
    const savedAdmin = typeof window !== "undefined" ? localStorage.getItem("adminEmail") : null
    if (savedAdmin) setAdminEmail(savedAdmin)
    fetchPanitia()
    resetPeserta()
    fetchCandidates()
    fetchBilik()
    fetchLandingContent()
    fetchJabatanFormatur()
    fetchLandingStatus()
    const unsubLandingSettings = onSnapshot(landingSettingsRef, (snap) => {
      if (snap.exists()) applyLandingSettings(snap.data(), true)
    })
    return () => unsubLandingSettings()
  }, [])

  const fetchPanitia = async () => {
    const snapshot = await getDocs(collection(db, "Data_Admin"))
    const list: Panitia[] = []
    snapshot.forEach((d) => {
      const data = d.data() as any
      const isAdmin = d.id.toLowerCase() === "admin" || data?.Role?.toLowerCase() === "admin"
      const isPanitia = data?.Role?.toLowerCase() === "panitia"
      if (!isAdmin && isPanitia) list.push({ id: d.id, ...data })
    })
    setPanitiaList(list)
  }

  const syncVotingTotals = async () => {
    try {
      const result = await apiPost("/api/admin/sync", {})
      setPesertaTotalCount(result.total || 0)
    } catch (err) { console.error("Failed to sync voting totals", err) }
  }

  const resetPeserta = useCallback(async () => {
    if (pesertaLoading) return
    setPesertaLoading(true)
    try {
      pesertaCursorRef.current = null
      const snapshot = await getDocs(query(collection(db, "Data_Peserta"), orderBy("NIB"), limit(PESERTA_PAGE_SIZE)))
      const page: Peserta[] = []
      snapshot.forEach((d) => page.push({ id: d.id, ...d.data() } as Peserta))
      setPesertaList(page)
      if (snapshot.docs.length > 0) pesertaCursorRef.current = snapshot.docs[snapshot.docs.length - 1]
      setPesertaHasMore(snapshot.docs.length === PESERTA_PAGE_SIZE)
      await syncVotingTotals()
    } catch { setPesertaHasMore(false) }
    finally { setPesertaLoading(false) }
  }, [])

  const loadMorePeserta = useCallback(async () => {
    if (pesertaLoading || !pesertaHasMore) return
    setPesertaLoading(true)
    try {
      const constraints: any[] = [orderBy("NIB"), limit(PESERTA_PAGE_SIZE)]
      if (pesertaCursorRef.current) constraints.push(startAfter(pesertaCursorRef.current))
      const snapshot = await getDocs(query(collection(db, "Data_Peserta"), ...constraints))
      const page: Peserta[] = []
      snapshot.forEach((d) => page.push({ id: d.id, ...d.data() } as Peserta))
      setPesertaList((prev) => [...prev, ...page])
      if (snapshot.docs.length > 0) pesertaCursorRef.current = snapshot.docs[snapshot.docs.length - 1]
      setPesertaHasMore(snapshot.docs.length === PESERTA_PAGE_SIZE)
    } catch { setPesertaHasMore(false) }
    finally { setPesertaLoading(false) }
  }, [pesertaLoading, pesertaHasMore])

  const fetchBilik = async () => {
    const snapshot = await getDocs(collection(db, "BilikVoting"))
    const list: Bilik[] = []
    snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Bilik))
    list.sort((a, b) => String(a.id).localeCompare(String(b.id)))
    setBilikList(list)
  }

  const fetchCandidates = async () => {
    const snapshot = await getDocs(collection(db, "Data_Calon_Formatur"))
    const list: Candidate[] = []
    snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Candidate))
    list.sort((a, b) => a.id.localeCompare(b.id))
    setCandidateList(list)
    setRolesMap((prev) => {
      if (Object.values(prev).every((v) => !v) && list.length) {
        const sorted = [...list].sort((a, b) => (b.JumlahVote || 0) - (a.JumlahVote || 0))
        const defaults: Record<string, string> = {}
        ROLE_OPTIONS.forEach((role, i) => { defaults[role.key] = sorted[i]?.id || "" })
        return { ...prev, ...defaults }
      }
      return prev
    })
  }

  const applyLandingSettings = (data: any, setPrevState = false) => {
    if (!data) return
    const winnerData = data.winner || data.FormaturTerpilih || {}
    const viewsData = data.views || data.LandingViews
    const historyData = data.editHistory || data.LandingEditHistory

    const nextStatus: LandingStatus = {
      showResults: data.showResults !== undefined ? Boolean(data.showResults) : true,
      winner: winnerData.Status !== undefined
        ? winnerData.Status === true || winnerData.Status === "true"
        : false,
    }
    setLandingStatus(nextStatus)
    if (setPrevState) setPrevLandingStatus(nextStatus)

    const roles = winnerData.Roles || winnerData.roles
    if (roles) { const merged = { ...rolesMap, ...roles }; setRolesMap(merged); if (setPrevState) setPrevRolesMap(merged) }
    else if (setPrevState) setPrevRolesMap(rolesMap)

    const labels = winnerData.RoleLabels || winnerData.roleLabels
    if (labels) { const merged = { ...roleLabels, ...labels }; setRoleLabels(merged); if (setPrevState) setPrevRoleLabels(merged) }
    else if (setPrevState) setPrevRoleLabels(roleLabels)

    if (viewsData) setViewStats(viewsData as ViewStats)
    if (historyData) { setEditHistory(historyData as EditHistory); setShowFullHistory(false) }
  }

  const fetchLandingContent = async () => {
    const snap = await getDoc(doc(db, "LandingContent", "main"))
    if (snap.exists()) {
      const data = snap.data() as LandingContent
      setLandingContent((prev) => { const merged = { ...prev, ...data }; setPrevLandingContent(merged); return merged })
    }
  }

  const fetchLandingStatus = async () => {
    try {
      const settingsSnap = await getDoc(landingSettingsRef)
      if (settingsSnap.exists()) { applyLandingSettings(settingsSnap.data(), true); return }
    } catch { console.error("Gagal memuat konfigurasi landing") }
  }

  const fetchJabatanFormatur = async () => {
    const snap = await getDocs(collection(db, "JabatanFormatur"))
    const incoming: Record<string, string> = {}
    snap.forEach((d) => { const key = labelToKey(d.data()?.Jabatan || ""); if (key) incoming[key] = d.id })
    if (Object.keys(incoming).length) { setRolesMap((prev) => { const merged = { ...prev, ...incoming }; setPrevRolesMap(merged); return merged }) }
  }

  const collectLandingChanges = () => {
    const changes: string[] = []
    const fVal = (v: any) => (v === undefined || v === null || v === "" ? "-" : String(v))
    const fBool = (v: boolean) => (v ? "ON" : "OFF")
    if (landingStatus.showResults !== prevLandingStatus.showResults) changes.push(`Tampilkan hasil pemilihan: ${fBool(landingStatus.showResults)} (sebelumnya ${fBool(prevLandingStatus.showResults)})`)
    if (landingStatus.winner !== prevLandingStatus.winner) changes.push(`Formatur terpilih: ${fBool(landingStatus.winner)} (sebelumnya ${fBool(prevLandingStatus.winner)})`)
    ROLE_OPTIONS.forEach((role) => {
      const prevRole = prevRolesMap[role.key] || ""; const currRole = rolesMap[role.key] || ""
      if (prevRole !== currRole) { const label = roleLabels[role.key] || role.label; changes.push(`Role ${label}: ${fVal(prevRole)} -> ${fVal(currRole)}`) }
      const prevL = prevRoleLabels[role.key] || role.label; const currL = roleLabels[role.key] || role.label
      if (prevL !== currL) changes.push(`Label ${role.label}: ${fVal(prevL)} -> ${fVal(currL)}`)
    })
    Object.keys(landingContent).forEach((key) => {
      const pv = (prevLandingContent as any)[key]; const cv = (landingContent as any)[key]
      if (pv !== cv) changes.push(`Konten ${key}: ${fVal(pv)} -> ${fVal(cv)}`)
    })
    return changes
  }

  const handleSaveAllLanding = async () => {
    setSavingLanding(true)
    const validatedContent = parseWithFeedback(landingContentSchema, landingContent, "Konten landing tidak valid")
    if (!validatedContent) { setSavingLanding(false); return }
    const sanitizedLabels: Record<string, string> = ROLE_OPTIONS.reduce((acc, role) => ({ ...acc, [role.key]: sanitizeText(roleLabels[role.key] || role.label, 80) }), {})
    const validRoles = ROLE_OPTIONS.reduce((acc, role) => {
      const id = rolesMap[role.key]; if (id && candidateList.some((c) => c.id === id)) acc[role.key] = id
      return acc
    }, {} as Record<string, string>)
    try {
      const changes = collectLandingChanges()
      await apiPost("/api/admin/landing", {
        action: "save",
        data: {
          landingContent: validatedContent,
          showResults: landingStatus.showResults,
          winner: landingStatus.winner,
          rolesMap: validRoles,
          roleLabels: sanitizedLabels,
          adminEmail: adminEmail || "admin",
          changes: changes.length ? changes.join(" | ") : "Tidak ada perubahan",
        },
      })
      setPrevLandingStatus(landingStatus); setPrevRolesMap(validRoles); setPrevRoleLabels(sanitizedLabels)
      setRolesMap(validRoles); setRoleLabels(sanitizedLabels)
      setLandingContent(validatedContent as LandingContent); setPrevLandingContent(validatedContent as LandingContent)
    } catch { console.error("Gagal menyimpan landing") }
    finally { setSavingLanding(false) }
  }

  const handleRefreshAll = useCallback(() => {
    fetchPanitia()
    resetPeserta()
    fetchCandidates()
    fetchBilik()
  }, [resetPeserta])

  return {
    panitiaList,
    pesertaList,
    candidateList,
    bilikList,
    pesertaLoading,
    pesertaHasMore,
    pesertaTotalCount,
    landingContent,
    landingStatus,
    rolesMap,
    roleLabels,
    viewStats,
    editHistory,
    adminEmail,
    savingLanding,
    activeTab,
    setActiveTab,
    mobileMenuOpen,
    setMobileMenuOpen,
    showFullHistory,
    setShowFullHistory,
    resetPeserta,
    loadMorePeserta,
    handleSaveAllLanding,
    handleRefreshAll,
    setLandingContent,
    setLandingStatus,
    setRolesMap,
    setRoleLabels,
    fetchCandidates,
  }
}
