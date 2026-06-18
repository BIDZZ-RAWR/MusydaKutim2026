"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import {
  doc,
  onSnapshot,
  updateDoc,
  increment,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { logError } from "@/lib/logger"

interface Candidate {
  id: string
  NamaCalonFormatur: string
  FotoCalonFormatur: string
}

interface BilikState {
  status: "idle" | "voting_active"
  activeVoterName?: string
  activeVoterNIB?: string
}

export function useMonitor(onToast: (variant: string, title: string, description: string) => void) {
  const params = useParams()
  const bilikId = params.id as string

  const [bilikState, setBilikState] = useState<BilikState>({ status: "idle" })
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        await updateDoc(doc(db, "BilikVoting", bilikId), { heartbeat: new Date() })
      } catch (error) {
        console.error("Heartbeat failed:", error)
      }
    }

    const resetStatus = async () => {
      try {
        await updateDoc(doc(db, "BilikVoting", bilikId), {
          status: "idle",
          activeVoterName: "",
          activeVoterNIB: "",
        })
      } catch (error) {
        console.error("Failed to reset status:", error)
      }
    }
    resetStatus()

    sendHeartbeat()
    const interval = setInterval(sendHeartbeat, 5000)
    return () => clearInterval(interval)
  }, [bilikId])

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "BilikVoting", bilikId), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as BilikState
        setBilikState(data)
        if (data.status === "idle") {
          setSelectedCandidates([])
        }
      }
    })
    return () => unsub()
  }, [bilikId])

  useEffect(() => {
    const fetchCandidates = async () => {
      const snapshot = await getDocs(collection(db, "Data_Calon_Formatur"))
      const cands: Candidate[] = []
      snapshot.forEach((doc) => {
        cands.push({ id: doc.id, ...doc.data() } as Candidate)
      })
      cands.sort((a, b) => a.id.localeCompare(b.id))
      setCandidates(cands)
    }
    fetchCandidates()
  }, [])

  const toggleCandidate = (id: string) => {
    setSelectedCandidates((prev) => {
      if (prev.includes(id)) return prev.filter((cid) => cid !== id)
      if (prev.length >= 9) {
        onToast("destructive", "Batas pilihan tercapai", "Pilih tepat 9 orang. Hapus pilihan lain sebelum menambah.")
        return prev
      }
      return [...prev, id]
    })
  }

  const handleVote = async () => {
    if (selectedCandidates.length !== 9) {
      onToast("destructive", "Pilih 9 calon", "Anda harus memilih tepat 9 orang sebelum menyimpan suara.")
      return
    }
    if (!bilikState.activeVoterNIB) return
    setIsSubmitting(true)

    try {
      const batch = writeBatch(db)
      const q = query(collection(db, "Data_Peserta"), where("NIB", "==", bilikState.activeVoterNIB))
      const participantSnapshot = await getDocs(q)
      if (!participantSnapshot.empty) {
        const participantDocRef = participantSnapshot.docs[0].ref
        batch.update(participantDocRef, { StatusVoting: "sudah" })
      } else {
        throw new Error(`Peserta dengan NIB ${bilikState.activeVoterNIB} tidak ditemukan saat menyimpan vote`)
      }

      selectedCandidates.forEach((cid) => {
        const candidateRef = doc(db, "Data_Calon_Formatur", cid)
        batch.update(candidateRef, { JumlahVote: increment(1) })
      })

      batch.update(doc(db, "TotalSudahVoting", "Total"), { TotalSudahVoting: increment(1) })
      batch.update(doc(db, "TotalBelumVoting", "Total"), { TotalBelumVoting: increment(-1) })
      batch.update(doc(db, "BilikVoting", bilikId), {
        status: "idle",
        activeVoterName: "",
        activeVoterNIB: "",
      })

      await batch.commit()
      setSelectedCandidates([])

      onToast("success", "Berhasil!", "Suara anda telah tersimpan.")
    } catch (error: any) {
      console.error("Voting failed:", error)
      logError("Gagal Menyimpan Suara", error.message || "Terjadi kesalahan sistem saat menyimpan suara")
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    bilikId,
    bilikState,
    candidates,
    selectedCandidates,
    isSubmitting,
    toggleCandidate,
    handleVote,
  }
}
