"use client"

import { useState, useRef } from "react"
import { doc, setDoc, updateDoc, deleteDoc, writeBatch, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pencil, Trash2, UserPlus, Upload, LayoutGrid, List, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import type { Candidate, CandidateForm } from "../types"
import { candidateSchema, candidateUpdateSchema } from "../constants"
import { uploadToCloudinary } from "../cloudinary"
import { EmptyState } from "./EmptyState"
import { ConfirmDialog } from "./ConfirmDialog"
import { validate } from "@/lib/validation"

interface CalonTabProps {
  candidateList: Candidate[]
  onRefresh: () => void
}

export function CalonTab({ candidateList, onRefresh }: CalonTabProps) {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [candidateForm, setCandidateForm] = useState<CandidateForm>({ id: "", name: "", photo: "" })
  const [editingCandidate, setEditingCandidate] = useState<any>(null)
  const [candidateUploading, setCandidateUploading] = useState(false)
  const [editingCandidateUploading, setEditingCandidateUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)
  const [confirmState, setConfirmState] = useState<{
    open: boolean
    title: string
    description?: string
    onConfirm?: () => void | Promise<void>
  }>({ open: false, title: "" })

  const openConfirm = (payload: { title: string; description?: string; onConfirm?: () => void | Promise<void> }) =>
    setConfirmState({ open: true, ...payload })
  const closeConfirm = () => setConfirmState((prev) => ({ ...prev, open: false }))

  const handleUploadPhoto = async (file: File, mode: "add" | "edit") => {
    if (!file.type.startsWith("image/")) { toast.error("Hanya boleh mengunggah file gambar"); return }
    if (file.size > 5 * 1024 * 1024) { toast.error("Ukuran file maksimal 5MB"); return }
    if (mode === "add") setCandidateUploading(true)
    else setEditingCandidateUploading(true)
    try {
      const url = await uploadToCloudinary(file)
      if (mode === "add") setCandidateForm((prev) => ({ ...prev, photo: url }))
      else setEditingCandidate((prev: any) => (prev ? { ...prev, FotoCalonFormatur: url } : prev))
      toast.success("Foto berhasil diunggah")
    } catch (error: any) { toast.error(error?.message || "Gagal upload foto") }
    finally { if (mode === "add") setCandidateUploading(false); else setEditingCandidateUploading(false) }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, mode: "add" | "edit") => {
    const file = e.target.files?.[0]; if (file) handleUploadPhoto(file, mode)
  }

  const handleDrop = (e: React.DragEvent, mode: "add" | "edit") => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files?.[0]; if (file) handleUploadPhoto(file, mode)
  }

  const handleAddCandidate = async () => {
    const validated = validate<CandidateForm>(candidateSchema, candidateForm)
    if (!validated) return
    if (candidateList.some((c) => c.id === validated.id)) {
      toast.error(`Nomor urut / ID Calon "${validated.id}" sudah digunakan.`); return
    }
    try {
      await setDoc(doc(db, "Data_Calon_Formatur", validated.id), {
        NamaCalonFormatur: validated.name, FotoCalonFormatur: validated.photo, JumlahVote: 0,
      }, { merge: true })
      toast.success("Data calon formatur berhasil disimpan")
      setCandidateForm({ id: "", name: "", photo: "" })
      onRefresh()
    } catch { toast.error("Gagal menyimpan data calon formatur") }
  }

  const handleUpdateCandidate = async () => {
    if (!editingCandidate) return
    const validated = validate<any>(candidateUpdateSchema, editingCandidate)
    if (!validated) return
    const oldId = validated.id; const targetId = validated.newId || validated.id
    const isChangingId = targetId !== oldId
    const existingOld = candidateList.find((c) => c.id === oldId)
    const payload = { NamaCalonFormatur: validated.NamaCalonFormatur, FotoCalonFormatur: validated.FotoCalonFormatur || "", JumlahVote: existingOld?.JumlahVote ?? 0 }
    try {
      if (!isChangingId) {
        await updateDoc(doc(db, "Data_Calon_Formatur", oldId), payload)
      } else {
        const batch = writeBatch(db)
        batch.set(doc(db, "Data_Calon_Formatur", targetId), payload)
        batch.delete(doc(db, "Data_Calon_Formatur", oldId))
        const [oldJabatanSnap, targetJabatanSnap] = await Promise.all([
          getDoc(doc(db, "JabatanFormatur", oldId)), getDoc(doc(db, "JabatanFormatur", targetId)),
        ])
        if (targetJabatanSnap.exists()) batch.delete(doc(db, "JabatanFormatur", targetId))
        if (oldJabatanSnap.exists()) { batch.set(doc(db, "JabatanFormatur", targetId), oldJabatanSnap.data()); batch.delete(doc(db, "JabatanFormatur", oldId)) }
        await batch.commit()
      }
      toast.success(`Data calon diperbarui${isChangingId ? ` (ID ${oldId} → ${targetId})` : ""}`)
      setEditingCandidate(null)
      onRefresh()
    } catch { toast.error("Gagal memperbarui data calon") }
  }

  const handleDeleteCandidate = (id: string) => {
    openConfirm({
      title: "Hapus Calon?",
      description: "Data calon formatur akan dihapus permanen.",
      onConfirm: async () => { await deleteDoc(doc(db, "Data_Calon_Formatur", id)); onRefresh(); toast.success("Calon berhasil dihapus") },
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Add Form */}
        <Card className="xl:col-span-1 h-fit border-stone-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-emerald-600" />
              <CardTitle className="text-stone-800 text-sm">Tambah Calon</CardTitle>
            </div>
            <CardDescription>Input nomor urut, nama, dan foto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-stone-600">Nomor Urut / ID</Label>
              <Input value={candidateForm.id} onChange={(e) => setCandidateForm({ ...candidateForm, id: e.target.value })}
                placeholder="01" maxLength={4} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-stone-600">Nama Calon</Label>
              <Input value={candidateForm.name} onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                placeholder="Nama lengkap" maxLength={80} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-stone-600">Upload Foto</Label>
              <input type="file" accept="image/*" ref={fileInputRef}
                onChange={(e) => handleFileSelect(e, "add")} className="hidden" id="photo-upload" />
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => handleDrop(e, "add")}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                  dragOver ? "border-emerald-400 bg-emerald-50" : "border-stone-300 hover:border-stone-400 hover:bg-stone-50"
                }`}
              >
                {candidateUploading ? (
                  <p className="text-xs text-emerald-600 animate-pulse">Mengunggah...</p>
                ) : candidateForm.photo ? (
                  <img src={candidateForm.photo} alt="Preview" className="h-full object-contain rounded-lg" />
                ) : (
                  <>
                    <Upload className="h-5 w-5 text-stone-400 mb-1" />
                    <span className="text-xs text-stone-500">Klik atau drag foto</span>
                  </>
                )}
              </div>
            </div>
            <Button onClick={handleAddCandidate} className="w-full bg-emerald-700 hover:bg-emerald-800"
              disabled={candidateUploading}>
              <UserPlus className="w-4 h-4 mr-2" /> Simpan Calon
            </Button>
          </CardContent>
        </Card>

        {/* Candidate List */}
        <div className="xl:col-span-3">
          <Card className="border-stone-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-stone-800 text-sm">Daftar Calon Formatur</CardTitle>
                  <CardDescription>{candidateList.length} kandidat terdaftar</CardDescription>
                </div>
                <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-0.5">
                  <button onClick={() => setViewMode("table")}
                    className={`p-1.5 rounded-md transition-colors ${viewMode === "table" ? "bg-white shadow-sm text-stone-800" : "text-stone-400 hover:text-stone-600"}`}>
                    <List className="h-4 w-4" />
                  </button>
                  <button onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-white shadow-sm text-stone-800" : "text-stone-400 hover:text-stone-600"}`}>
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {candidateList.length === 0 ? (
                <div className="px-6 pb-6">
                  <EmptyState icon={ImageIcon} title="Belum ada calon"
                    description="Tambahkan calon formatur melalui form di samping." />
                </div>
              ) : viewMode === "table" ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-stone-600 w-16">No</TableHead>
                        <TableHead className="text-stone-600">Nama</TableHead>
                        <TableHead className="text-stone-600">Foto</TableHead>
                        <TableHead className="text-stone-600">Suara</TableHead>
                        <TableHead className="text-right text-stone-600">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {candidateList.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-semibold">{c.id}</TableCell>
                          <TableCell className="text-stone-800 font-medium">{c.NamaCalonFormatur}</TableCell>
                          <TableCell>
                            {c.FotoCalonFormatur ? (
                              <img src={c.FotoCalonFormatur} alt={c.NamaCalonFormatur}
                                className="w-10 h-10 object-cover rounded-lg border border-stone-200" />
                            ) : <span className="text-xs text-stone-400">—</span>}
                          </TableCell>
                          <TableCell className="font-mono text-sm">{c.JumlahVote || 0}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Dialog open={editingCandidate?.id === c.id}
                                onOpenChange={(open) => !open && setEditingCandidate(null)}>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="icon" className="h-8 w-8"
                                    onClick={() => setEditingCandidate({ ...c, newId: c.id })}>
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader><DialogTitle>Edit Calon {c.id}</DialogTitle></DialogHeader>
                                  <div className="space-y-3 py-2">
                                    <div className="space-y-2">
                                      <Label className="text-xs text-stone-600">Nomor Urut / ID</Label>
                                      <Input value={editingCandidate?.newId || ""}
                                        onChange={(e) => setEditingCandidate({ ...editingCandidate, newId: e.target.value })} maxLength={4} />
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-xs text-stone-600">Nama</Label>
                                      <Input value={editingCandidate?.NamaCalonFormatur || ""}
                                        onChange={(e) => setEditingCandidate({ ...editingCandidate, NamaCalonFormatur: e.target.value })} maxLength={80} />
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-xs text-stone-600">Link Foto</Label>
                                      <Input value={editingCandidate?.FotoCalonFormatur || ""}
                                        onChange={(e) => setEditingCandidate({ ...editingCandidate, FotoCalonFormatur: e.target.value })} type="url" />
                                      <input type="file" accept="image/*" ref={editFileInputRef}
                                        onChange={(e) => handleFileSelect(e, "edit")} className="hidden" id="edit-photo-upload" />
                                      <Label htmlFor="edit-photo-upload"
                                        className="flex items-center justify-center gap-2 h-10 rounded-xl border-2 border-dashed border-stone-300 cursor-pointer hover:bg-stone-50 text-xs text-stone-500">
                                        <Upload className="h-4 w-4" /> Upload dari perangkat
                                      </Label>
                                      {editingCandidateUploading && <p className="text-xs text-emerald-600 animate-pulse">Mengunggah...</p>}
                                    </div>
                                    <Button onClick={handleUpdateCandidate} className="w-full">Simpan Perubahan</Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDeleteCandidate(c.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {candidateList.map((c) => (
                    <div key={c.id}
                      className="group rounded-xl border border-stone-200 bg-white p-4 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                      <div className="relative mb-3">
                        {c.FotoCalonFormatur ? (
                          <img src={c.FotoCalonFormatur} alt={c.NamaCalonFormatur}
                            className="w-full h-36 object-cover rounded-lg border border-stone-100" />
                        ) : (
                          <div className="w-full h-36 rounded-lg bg-stone-100 flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-stone-300" />
                          </div>
                        )}
                        <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-stone-800 text-xs font-bold px-2 py-0.5 rounded-md shadow-sm">
                          #{c.id}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-stone-800 mb-1">{c.NamaCalonFormatur}</h3>
                      <p className="text-xs text-stone-500 mb-3">{c.JumlahVote || 0} suara</p>
                      <div className="flex gap-1.5">
                        <Dialog open={editingCandidate?.id === c.id}
                          onOpenChange={(open) => !open && setEditingCandidate(null)}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs"
                              onClick={() => setEditingCandidate({ ...c, newId: c.id })}>
                              <Pencil className="h-3 w-3 mr-1" /> Edit
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                        <Button variant="destructive" size="sm" className="h-8 text-xs"
                          onClick={() => handleDeleteCandidate(c.id)}>
                          <Trash2 className="h-3 w-3 mr-1" /> Hapus
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog open={confirmState.open} title={confirmState.title}
        description={confirmState.description} onConfirm={confirmState.onConfirm} onClose={closeConfirm} />
    </div>
  )
}
