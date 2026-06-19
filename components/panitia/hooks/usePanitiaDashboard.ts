"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, updateDoc, getDocs, query, collection, where, onSnapshot, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { logError, getCameraErrorMessage } from "@/lib/logger"

export function usePanitiaDashboard() {
  const params = useParams()
  const router = useRouter()
  const panitiaId = params.id as string
  const processingRef = useRef(false)

  const [scanResult, setScanResult] = useState("")
  const [status, setStatus] = useState("idle")
  const [message, setMessage] = useState("")
  const [monitorConnected, setMonitorConnected] = useState(false)
  const [lastHeartbeat, setLastHeartbeat] = useState<Date | null>(null)

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "BilikVoting", panitiaId), (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        const heartbeat = data.heartbeat?.toDate()
        setLastHeartbeat(heartbeat || null)

        if (heartbeat) {
          const now = new Date()
          const diff = now.getTime() - heartbeat.getTime()
          setMonitorConnected(diff < 10000)
        } else {
          setMonitorConnected(false)
        }
      }
    })

    return () => unsubscribe()
  }, [panitiaId])

  const handleScannerError = async (err: unknown) => {
    const readable = getCameraErrorMessage(err)
    setStatus("error")
    setMessage(readable)
    await logError("QR Scanner Error", readable)
  }

  const handleProcessParticipant = async (nib: string) => {
    if (processingRef.current) return
    processingRef.current = true

    try {
      if (!monitorConnected) {
        setStatus("error")
        setMessage("Monitor belum terhubung! Pastikan monitor sudah dibuka.")
        logError("Monitor Disconnected", `Percobaan scan NIB ${nib} saat monitor mati di Bilik ${panitiaId}`)
        return
      }

      setStatus("processing")
      setMessage("Mencari data peserta...")

      const q = query(
        collection(db, "Data_Peserta"),
        where("NIB", "==", nib),
        where("StatusVoting", "==", "belum"),
        limit(1),
      )
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        setStatus("error")
        setMessage("Peserta tidak ditemukan atau sudah memilih!")
        logError(
          "Peserta Tidak Ditemukan / Sudah Memilih",
          `NIB ${nib} tidak tersedia untuk voting (tidak ditemukan atau sudah memilih) di Bilik ${panitiaId}`,
        )
        return
      }

      const participantDoc = querySnapshot.docs[0]
      const participantData = participantDoc.data()

      const bilikRef = doc(db, "BilikVoting", panitiaId)

      await updateDoc(bilikRef, {
        activeVoterNIB: nib,
        activeVoterName: participantData.NamaPeserta,
        status: "voting_active",
        timestamp: new Date(),
      })

      setStatus("success")
      setMessage(`Silakan arahkan ${participantData.NamaPeserta} ke Bilik ${panitiaId}`)
      setScanResult("")
    } catch (error: any) {
      console.error(error)
      setStatus("error")
      setMessage("Terjadi kesalahan sistem.")
      logError("System Error", `Error saat memproses peserta ${nib}: ${error.message}`)
    } finally {
      processingRef.current = false
    }
  }

  return {
    panitiaId,
    router,
    scanResult, setScanResult,
    status,
    message,
    monitorConnected,
    lastHeartbeat,
    handleScannerError,
    handleProcessParticipant,
  }
}
