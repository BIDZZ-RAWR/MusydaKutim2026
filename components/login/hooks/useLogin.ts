"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function useLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showModeSelection, setShowModeSelection] = useState(false)
  const [panitiaId, setPanitiaId] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Email atau password salah.")
        return
      }

      const { user } = await res.json()

      if (user.role === "admin") {
        localStorage.setItem("adminEmail", email)
        localStorage.setItem("role", "admin")
        router.push("/admin/dashboard")
      } else {
        const pId = user.panitiaId || "01"
        setPanitiaId(pId)
        localStorage.setItem("panitiaId", pId)
        localStorage.setItem("role", "panitia")
        setShowModeSelection(true)
      }
    } catch {
      setError("Terjadi kesalahan saat login.")
    } finally {
      setLoading(false)
    }
  }

  const handleModeSelect = (mode: "monitor" | "hp") => {
    if (mode === "monitor") {
      router.push(`/panitia/${panitiaId}/monitor`)
    } else {
      router.push(`/panitia/${panitiaId}/dashboard`)
    }
  }

  return {
    email, setEmail,
    password, setPassword,
    loading,
    error,
    showModeSelection, setShowModeSelection,
    handleLogin,
    handleModeSelect,
  }
}
