"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Trash2, Plus, UserCog, Monitor } from "lucide-react"
import { toast } from "sonner"
import type { Panitia, Bilik } from "../types"
import { panitiaSchema, bilikSimpleSchema, emailOrUsernameSchema } from "../constants"
import { validate } from "@/lib/validation"
import { apiPost } from "@/lib/api-client"
import { StatusBadge } from "./StatusBadge"
import { EmptyState } from "./EmptyState"
import { ConfirmDialog } from "./ConfirmDialog"

interface PanitiaTabProps {
  panitiaList: Panitia[]
  bilikList: Bilik[]
  onRefresh: () => void
}

export function PanitiaTab({ panitiaList, bilikList, onRefresh }: PanitiaTabProps) {
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [editingPanitia, setEditingPanitia] = useState<any>(null)
  const [newBilik, setNewBilik] = useState({ id: "", name: "", monitor: "" })
  const [editingBilik, setEditingBilik] = useState<any>(null)
  const [confirmState, setConfirmState] = useState<{
    open: boolean
    title: string
    description?: string
    onConfirm?: () => void | Promise<void>
  }>({ open: false, title: "" })
  const [addPanitiaOpen, setAddPanitiaOpen] = useState(false)
  const [addBilikOpen, setAddBilikOpen] = useState(false)

  const openConfirm = (payload: { title: string; description?: string; onConfirm?: () => void | Promise<void> }) =>
    setConfirmState({ open: true, ...payload })
  const closeConfirm = () => setConfirmState((prev) => ({ ...prev, open: false }))

  const handleAddPanitia = async () => {
    const resolvedEmail = newEmail.includes("@") ? newEmail.trim() : `${newEmail.trim()}@gmail.com`
    const validated = validate<{ email: string; password: string }>(panitiaSchema, { email: resolvedEmail, password: newPassword })
    if (!validated) return
    try {
      await apiPost("/api/admin/panitia", { action: "createPanitia", data: validated })
      toast.success("Panitia berhasil ditambahkan")
      setNewEmail(""); setNewPassword("")
      setAddPanitiaOpen(false)
      onRefresh()
    } catch { toast.error("Gagal menambahkan panitia") }
  }

  const handleEditPanitia = async (id: string, email: string, password?: string) => {
    const validatedEmail = validate<string>(emailOrUsernameSchema, email, "Email/username tidak valid")
    if (!validatedEmail) return
    try {
      const payload: Record<string, string> = { email: validatedEmail }
      if (password?.trim()) payload.password = password.trim()
      await apiPost("/api/admin/panitia", { action: "updatePanitia", data: { id, ...payload } })
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
        await apiPost("/api/admin/panitia", { action: "deletePanitia", data: { id } })
        onRefresh()
        toast.success("Panitia berhasil dihapus")
      },
    })
  }

  const handleAddBilik = async () => {
    const validated = validate<{ id: string; name?: string; monitor?: string }>(
      bilikSimpleSchema, newBilik, "Data bilik tidak valid",
    )
    if (!validated) return
    const bilikId = validated.id.padStart(2, "0")
    const payload = { id: bilikId, name: validated.name || `Bilik ${bilikId}`, monitor: validated.monitor || "", email: "", handphone: "" }
    try {
      await apiPost("/api/admin/panitia", { action: "createBilik", data: payload })
      setNewBilik({ id: "", name: "", monitor: "" })
      setAddBilikOpen(false)
      onRefresh()
      toast.success("Bilik berhasil ditambahkan")
    } catch { toast.error("Gagal menyimpan bilik") }
  }

  const handleDeleteBilik = (id: string) => {
    openConfirm({
      title: "Hapus Bilik?",
      description: "Bilik akan dihapus dari daftar monitor.",
      onConfirm: async () => {
        await apiPost("/api/admin/panitia", { action: "deleteBilik", data: { id } })
        onRefresh()
        toast.success("Bilik berhasil dihapus")
      },
    })
  }

  const handleUpdateBilik = async () => {
    if (!editingBilik) return
    const { id, name, Monitor, Email, Handphone } = editingBilik
    try {
      await apiPost("/api/admin/panitia", { action: "updateBilik", data: { id, name, monitor: Monitor, email: Email, handphone: Handphone } })
      setEditingBilik(null)
      onRefresh()
      toast.success("Bilik berhasil diperbarui")
    } catch { toast.error("Gagal memperbarui bilik") }
  }

  const suggestNextId = () => {
    const ids = bilikList.map((b) => parseInt(b.id, 10)).filter((n) => !isNaN(n))
    const next = ids.length ? Math.max(...ids) + 1 : 1
    const nextStr = String(next).padStart(2, "0")
    setNewBilik({ id: nextStr, name: `Bilik ${nextStr}`, monitor: "" })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Akun Panitia */}
      <Card className="border-stone-200 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <UserCog className="h-4 w-4 text-emerald-600" />
              <CardTitle className="text-stone-800 text-sm">Daftar Panitia</CardTitle>
            </div>
            <CardDescription>{panitiaList.length} akun terdaftar</CardDescription>
          </div>
          <Dialog open={addPanitiaOpen} onOpenChange={setAddPanitiaOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 shrink-0">
                <Plus className="w-4 h-4 mr-1.5" /> Tambah Akun
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Tambah Panitia</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
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
              </div>
            </DialogContent>
          </Dialog>
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
                  {panitiaList.map((p) => (
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

      {/* Bilik Voting */}
      <Card className="border-stone-200 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-emerald-600" />
              <CardTitle className="text-stone-800 text-sm">Manajemen Bilik</CardTitle>
            </div>
            <CardDescription>{bilikList.length} bilik terdaftar</CardDescription>
          </div>
          <Dialog open={addBilikOpen} onOpenChange={setAddBilikOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 shrink-0">
                <Plus className="w-4 h-4 mr-1.5" /> Tambah Bilik
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Tambah Bilik</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-stone-600">ID Bilik</Label>
                    <button type="button" onClick={suggestNextId}
                      className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium">
                      Auto next
                    </button>
                  </div>
                  <Input placeholder="01" value={newBilik.id}
                    onChange={(e) => {
                      const id = e.target.value
                      setNewBilik((prev) => ({ ...prev, id, name: id ? `Bilik ${id.padStart(2, "0")}` : "" }))
                    }}
                    inputMode="numeric" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-stone-600">Nama</Label>
                  <Input placeholder="Bilik 01" value={newBilik.name}
                    onChange={(e) => setNewBilik({ ...newBilik, name: e.target.value })} maxLength={60} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-stone-600">Monitor</Label>
                  <Select value={newBilik.monitor} onValueChange={(v) => setNewBilik({ ...newBilik, monitor: v === "__none__" ? "" : v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih panitia..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Kosongkan</SelectItem>
                      {panitiaList.map((p) => (
                        <SelectItem key={p.id} value={p.Email}>{p.Email}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddBilik} className="w-full bg-emerald-700 hover:bg-emerald-800">
                  <Plus className="w-4 h-4 mr-1.5" /> Simpan Bilik
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-stone-600 whitespace-nowrap">ID</TableHead>
                  <TableHead className="text-stone-600 whitespace-nowrap">Nama</TableHead>
                  <TableHead className="text-stone-600 whitespace-nowrap">Monitor</TableHead>
                  <TableHead className="text-stone-600 whitespace-nowrap">Status</TableHead>
                  <TableHead className="text-right text-stone-600 whitespace-nowrap">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bilikList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-stone-500 py-6">
                      Belum ada bilik terdaftar
                    </TableCell>
                  </TableRow>
                ) : (
                  bilikList.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-semibold">{b.id}</TableCell>
                      <TableCell>{b.name || `Bilik ${b.id}`}</TableCell>
                      <TableCell className="text-stone-600">{b.Monitor || "-"}</TableCell>
                      <TableCell><StatusBadge status={b.status || "idle"} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Dialog open={editingBilik?.id === b.id}
                            onOpenChange={(open) => { if (!open) setEditingBilik(null) }}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="icon" className="h-8 w-8"
                                onClick={() => setEditingBilik({ ...b })}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </DialogTrigger>
                            {editingBilik?.id === b.id && (
                              <DialogContent>
                                <DialogHeader><DialogTitle>Edit Bilik {b.id}</DialogTitle></DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label className="text-xs text-stone-600">Nama</Label>
                                    <Input value={editingBilik.name ?? ""}
                                      onChange={(e) => setEditingBilik((prev: any) =>
                                        prev ? { ...prev, name: e.target.value } : prev)} maxLength={60} />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs text-stone-600">Monitor</Label>
                                    <Select value={editingBilik.Monitor ?? ""}
                                      onValueChange={(v) => setEditingBilik((prev: any) =>
                                        prev ? { ...prev, Monitor: v === "__none__" ? "" : v } : prev)}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Pilih panitia..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="__none__">Kosongkan</SelectItem>
                                        {panitiaList.map((p) => (
                                          <SelectItem key={p.id} value={p.Email}>{p.Email}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs text-stone-600">Email</Label>
                                    <Input type="email" value={editingBilik.Email ?? ""}
                                      onChange={(e) => setEditingBilik((prev: any) =>
                                        prev ? { ...prev, Email: e.target.value } : prev)} />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs text-stone-600">HP</Label>
                                    <Input value={editingBilik.Handphone ?? ""}
                                      onChange={(e) => setEditingBilik((prev: any) =>
                                        prev ? { ...prev, Handphone: e.target.value } : prev)}
                                      inputMode="tel" maxLength={18} />
                                  </div>
                                  <Button onClick={handleUpdateBilik}>
                                    Simpan Perubahan
                                  </Button>
                                </div>
                              </DialogContent>
                            )}
                          </Dialog>
                          <Button variant="destructive" size="icon" className="h-8 w-8"
                            onClick={() => handleDeleteBilik(b.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog open={confirmState.open} title={confirmState.title}
        description={confirmState.description} onConfirm={confirmState.onConfirm} onClose={closeConfirm} />
    </div>
  )
}
