"use client"

import { useState } from "react"
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import bcrypt from "bcryptjs"
import { Pencil, Trash2, Plus, UserCog, Monitor } from "lucide-react"
import { toast } from "sonner"
import type { Panitia, Bilik, ViewStats, EditHistory } from "../types"
import { panitiaSchema, bilikSchema, emailOrUsernameSchema, passwordSchema } from "../constants"
import { validate } from "@/lib/validation"
import { formatTimestamp } from "@/lib/utils"
import { StatusBadge } from "./StatusBadge"
import { EmptyState } from "./EmptyState"
import { ConfirmDialog } from "./ConfirmDialog"

interface PanitiaTabProps {
  panitiaList: Panitia[]
  bilikList: Bilik[]
  viewStats: ViewStats
  editHistory: EditHistory
  showFullHistory: boolean
  setShowFullHistory: React.Dispatch<React.SetStateAction<boolean>>
  onRefresh: () => void
}

export function PanitiaTab({
  panitiaList,
  bilikList,
  viewStats,
  editHistory,
  showFullHistory,
  setShowFullHistory,
  onRefresh,
}: PanitiaTabProps) {
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [editingPanitia, setEditingPanitia] = useState<any>(null)
  const [newBilik, setNewBilik] = useState({ id: "", name: "", monitor: "", email: "", handphone: "" })
  const [confirmState, setConfirmState] = useState<{
    open: boolean
    title: string
    description?: string
    onConfirm?: () => void | Promise<void>
  }>({ open: false, title: "" })

  const openConfirm = (payload: { title: string; description?: string; onConfirm?: () => void | Promise<void> }) =>
    setConfirmState({ open: true, ...payload })
  const closeConfirm = () => setConfirmState((prev) => ({ ...prev, open: false }))

  const historyText = editHistory.ApaYangDiEdit || "Belum ada catatan"
  const isLongHistory = historyText.length > 160
  const displayHistory = isLongHistory && !showFullHistory ? `${historyText.slice(0, 160)}...` : historyText

  const handleAddPanitia = async () => {
    const validated = validate<{ email: string; password: string }>(panitiaSchema, { email: newEmail, password: newPassword })
    if (!validated) return
    try {
      const hashedPassword = await bcrypt.hash(validated.password, 12)
      await addDoc(collection(db, "Data_Admin"), {
        Email: validated.email,
        Password: hashedPassword,
        Role: "Panitia",
      })
      toast.success("Panitia berhasil ditambahkan")
      setNewEmail(""); setNewPassword("")
      onRefresh()
    } catch { toast.error("Gagal menambahkan panitia") }
  }

  const handleEditPanitia = async (id: string, email: string, password?: string) => {
    const validatedEmail = validate<string>(emailOrUsernameSchema, email, "Email/username tidak valid")
    if (!validatedEmail) return
    const payload: Record<string, string> = { Email: validatedEmail }
    if (password && password.trim()) {
      const validatedPassword = validate<string>(passwordSchema, password.trim(), "Password baru tidak valid")
      if (!validatedPassword) return
      payload.Password = await bcrypt.hash(validatedPassword, 12)
    }
    try {
      await updateDoc(doc(db, "Data_Admin", id), payload)
      setEditingPanitia(null)
      onRefresh()
      toast.success("Data panitia diperbarui")
    } catch { toast.error("Gagal update data") }
  }

  const handleDeletePanitia = (id: string) => {
    openConfirm({
      title: "Hapus Panitia?",
      description: "Aksi ini akan menghapus akun panitia secara permanen.",
      onConfirm: async () => {
        await deleteDoc(doc(db, "Data_Admin", id))
        onRefresh()
        toast.success("Panitia berhasil dihapus")
      },
    })
  }

  const handleAddBilik = async () => {
    const validated = validate<{ id: string; name?: string; monitor?: string; email?: string; handphone?: string }>(
      bilikSchema, newBilik, "Data bilik tidak valid",
    )
    if (!validated) return
    const bilikId = validated.id.padStart(2, "0")
    try {
      await setDoc(doc(db, "BilikVoting", bilikId), {
        name: validated.name || `Bilik ${bilikId}`,
        status: "idle",
        activeVoterName: "",
        activeVoterNIB: "",
        heartbeat: serverTimestamp(),
        createdAt: serverTimestamp(),
        timestamp: serverTimestamp(),
        Monitor: validated.monitor || `monitor${bilikId}`,
        Email: validated.email || "",
        Handphone: validated.handphone || "",
      }, { merge: true })
      setNewBilik({ id: "", name: "", monitor: "", email: "", handphone: "" })
      onRefresh()
      toast.success("Bilik berhasil ditambahkan/diperbarui")
    } catch { toast.error("Gagal menyimpan bilik") }
  }

  const handleDeleteBilik = (id: string) => {
    openConfirm({
      title: "Hapus Bilik?",
      description: "Bilik akan dihapus dari daftar monitor.",
      onConfirm: async () => {
        await deleteDoc(doc(db, "BilikVoting", id))
        onRefresh()
        toast.success("Bilik berhasil dihapus")
      },
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-stone-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-stone-800 text-sm">Kunjungan Landing</CardTitle>
            <CardDescription>Total pengunjung website</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-3xl font-bold text-emerald-700 tabular-nums">{viewStats.Jumlah || 0}</div>
            <div className="text-[11px] text-stone-500 text-right">
              {formatTimestamp(viewStats.lastView) || "Belum ada data"}
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-stone-800 text-sm">Riwayat Edit</CardTitle>
            <CardDescription>Perubahan terakhir oleh admin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="font-semibold text-stone-800">Akun: {editHistory.akun || "-"}</div>
            <div className="text-stone-700">{displayHistory}</div>
            {isLongHistory && (
                <Button variant="ghost" size="sm" className="px-0 text-emerald-700 h-auto" onClick={() => setShowFullHistory(!showFullHistory)}>
                {showFullHistory ? "See less" : "See more"}
              </Button>
            )}
            <div className="text-[11px] text-stone-500">
              {formatTimestamp(editHistory.timestamp)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Add Panitia Form */}
        <Card className="xl:col-span-1 h-fit border-stone-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCog className="h-4 w-4 text-emerald-600" />
              <CardTitle className="text-stone-800 text-sm">Tambah Panitia</CardTitle>
            </div>
            <CardDescription>Buat akun baru untuk panitia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-stone-600">Email / Username</Label>
              <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                placeholder="panitia01" required minLength={3} maxLength={120} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-stone-600">Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 8 karakter" required minLength={8} maxLength={64} />
            </div>
            <Button onClick={handleAddPanitia} className="w-full bg-emerald-700 hover:bg-emerald-800">
              <Plus className="w-4 h-4 mr-2" /> Tambah Akun
            </Button>
          </CardContent>
        </Card>

        {/* Panitia & Bilik Tables */}
        <div className="xl:col-span-2 space-y-6">
          {/* Panitia Table */}
          <Card className="border-stone-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-stone-800 text-sm">Daftar Panitia</CardTitle>
              <CardDescription>{panitiaList.length} akun terdaftar</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {panitiaList.length === 0 ? (
                <div className="px-6 pb-6">
                  <EmptyState title="Belum ada panitia" description="Tambahkan akun panitia untuk mulai mengelola." />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-stone-600">Username</TableHead>
                        <TableHead className="text-right text-stone-600">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {panitiaList.map((p, idx) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium text-stone-800">{p.Email}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1.5">
                              <Dialog open={editingPanitia?.id === p.id}
                                onOpenChange={(open) => { if (!open) setEditingPanitia(null) }}>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="icon" className="h-8 w-8"
                                    onClick={() => setEditingPanitia({ ...p, Password: "" })}>
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                </DialogTrigger>
                                {editingPanitia?.id === p.id && (
                                  <DialogContent>
                                    <DialogHeader><DialogTitle>Edit Panitia</DialogTitle></DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <Label className="text-xs text-stone-600">Email / Username</Label>
                                        <Input value={editingPanitia?.Email ?? ""}
                                          onChange={(e) => setEditingPanitia((prev: any) =>
                                            prev ? { ...prev, Email: e.target.value } : prev)} />
                                      </div>
                                      <div className="space-y-2">
                                        <Label className="text-xs text-stone-600">Password Baru</Label>
                                        <Input type="password" placeholder="Kosongkan jika tidak diganti"
                                          value={editingPanitia?.Password ?? ""}
                                          onChange={(e) => setEditingPanitia((prev: any) =>
                                            prev ? { ...prev, Password: e.target.value } : prev)} />
                                      </div>
                                      <Button onClick={() => {
                                        if (!editingPanitia) return
                                        handleEditPanitia(p.id, editingPanitia.Email, editingPanitia.Password)
                                      }}>
                                        Simpan Perubahan
                                      </Button>
                                    </div>
                                  </DialogContent>
                                )}
                              </Dialog>
                              <Button variant="destructive" size="icon" className="h-8 w-8"
                                onClick={() => handleDeletePanitia(p.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bilik Management */}
          <Card className="border-stone-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-emerald-600" />
                <CardTitle className="text-stone-800 text-sm">Manajemen Bilik</CardTitle>
              </div>
              <CardDescription>Tambah / hapus bilik voting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-stone-600">ID Bilik</Label>
                  <Input placeholder="01" value={newBilik.id}
                    onChange={(e) => setNewBilik({ ...newBilik, id: e.target.value })}
                    inputMode="numeric" pattern="\\d{1,3}" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-stone-600">Nama</Label>
                  <Input placeholder="Bilik 01" value={newBilik.name}
                    onChange={(e) => setNewBilik({ ...newBilik, name: e.target.value })} maxLength={60} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-stone-600">Monitor</Label>
                  <Input placeholder="monitor01" value={newBilik.monitor}
                    onChange={(e) => setNewBilik({ ...newBilik, monitor: e.target.value })} maxLength={60} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-stone-600">Email</Label>
                  <Input placeholder="panitia@email.com" value={newBilik.email}
                    onChange={(e) => setNewBilik({ ...newBilik, email: e.target.value })} type="email" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-stone-600">HP</Label>
                  <Input placeholder="08xxxx" value={newBilik.handphone}
                    onChange={(e) => setNewBilik({ ...newBilik, handphone: e.target.value })} inputMode="tel" maxLength={18} />
                </div>
              </div>
              <Button onClick={handleAddBilik} className="bg-emerald-700 hover:bg-emerald-800">
                <Plus className="w-4 h-4 mr-1.5" /> Simpan Bilik
              </Button>

              <div className="overflow-x-auto rounded-xl border border-stone-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-stone-600">ID</TableHead>
                      <TableHead className="text-stone-600">Nama</TableHead>
                      <TableHead className="text-stone-600">Status</TableHead>
                      <TableHead className="text-right text-stone-600">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bilikList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-sm text-stone-500 py-6">
                          Belum ada bilik terdaftar
                        </TableCell>
                      </TableRow>
                    ) : (
                      bilikList.map((b) => (
                        <TableRow key={b.id}>
                          <TableCell className="font-semibold">{b.id}</TableCell>
                          <TableCell>{b.name || `Bilik ${b.id}`}</TableCell>
                          <TableCell><StatusBadge status={b.status || "idle"} /></TableCell>
                          <TableCell className="text-right">
                            <Button variant="destructive" size="icon" className="h-8 w-8"
                              onClick={() => handleDeleteBilik(b.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog open={confirmState.open} title={confirmState.title}
        description={confirmState.description} onConfirm={confirmState.onConfirm} onClose={closeConfirm} />
    </div>
  )
}
