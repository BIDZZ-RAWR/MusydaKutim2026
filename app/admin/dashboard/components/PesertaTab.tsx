"use client"

import { useState, useRef, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Download, Pencil, Eye, FileSpreadsheet, Plus, Search, RotateCcw, X, Trash2, LayoutGrid, List } from "lucide-react"
import { toast } from "sonner"
import type { Peserta } from "../types"
import { generateQrCodeUrl, generateA4Sheets } from "./qrGenerator"
import { pesertaSchema } from "../constants"
import { useDebounce } from "../hooks/useDebounce"
import { StatusBadge } from "./StatusBadge"
import { LoadingSkeleton } from "./LoadingSkeleton"
import { EmptyState } from "./EmptyState"
import { BulkActionBar } from "./BulkActionBar"
import { ConfirmDialog } from "./ConfirmDialog"
import { QrCodeDialog } from "./QrCodeDialog"
import { validate } from "@/lib/validation"
import { apiPost } from "@/lib/api-client"

interface PesertaTabProps {
  pesertaList: Peserta[]
  pesertaTotalCount: number
  pesertaLoading: boolean
  pesertaHasMore: boolean
  onRefresh: () => void
  onLoadMore: () => void
  onReset: () => void
}

export function PesertaTab({
  pesertaList,
  pesertaTotalCount,
  pesertaLoading,
  pesertaHasMore,
  onRefresh,
  onLoadMore,
  onReset,
}: PesertaTabProps) {
  const [newPeserta, setNewPeserta] = useState({ Nama: "", Pimpinan: "", NIB: "" })
  const [editingPeserta, setEditingPeserta] = useState<any>(null)
  const [selectedPesertaIds, setSelectedPesertaIds] = useState<string[]>([])
  const [pesertaSearch, setPesertaSearch] = useState("")
  const [viewQrPeserta, setViewQrPeserta] = useState<Peserta | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [viewMode, setViewMode] = useState<"table" | "card">("table")
  const [confirmState, setConfirmState] = useState<{
    open: boolean
    title: string
    description?: string
    onConfirm?: () => void | Promise<void>
  }>({ open: false, title: "" })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const debouncedSearch = useDebounce(pesertaSearch, 300)

  const openConfirm = (payload: { title: string; description?: string; onConfirm?: () => void | Promise<void> }) =>
    setConfirmState({ open: true, ...payload })
  const closeConfirm = () => setConfirmState((prev) => ({ ...prev, open: false }))

  const filteredPeserta = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    return pesertaList.filter((p) => {
      const matchesSearch =
        q.length === 0 ||
        String(p.NIB || "").toLowerCase().includes(q) ||
        String(p.Pimpinan || "").toLowerCase().includes(q) ||
        String(p.NamaPeserta || "").toLowerCase().includes(q)
      return matchesSearch
    })
  }, [pesertaList, debouncedSearch])

  const handleAddPeserta = async () => {
    const validated = validate<{ Nama: string; Pimpinan: string; NIB: string }>(pesertaSchema, newPeserta)
    if (!validated) return
    try {
      await apiPost("/api/admin/peserta", { action: "create", data: validated })
      toast.success("Peserta berhasil ditambahkan")
      setNewPeserta({ Nama: "", Pimpinan: "", NIB: "" })
      onReset()
    } catch { toast.error("Gagal tambah peserta") }
  }

  const handleEditPeserta = async () => {
    if (!editingPeserta) return
    try {
      await apiPost("/api/admin/peserta", {
        action: "update",
        data: { id: editingPeserta.id, Nama: editingPeserta.NamaPeserta, Pimpinan: editingPeserta.Pimpinan, NIB: editingPeserta.NIB },
      })
      toast.success("Data peserta berhasil diperbarui")
      setEditingPeserta(null)
      onReset()
    } catch { toast.error("Gagal update data peserta") }
  }

  const handleDeletePeserta = (id: string) => {
    openConfirm({
      title: "Hapus Peserta?", description: "Data peserta akan dihapus secara permanen.",
      onConfirm: async () => {
        await apiPost("/api/admin/peserta", { action: "delete", data: { id } })
        onReset()
        setSelectedPesertaIds((prev) => prev.filter((pid) => pid !== id))
        toast.success("Peserta berhasil dihapus")
      },
    })
  }

  const handleToggleSelectPeserta = (id: string) => {
    setSelectedPesertaIds((prev) => (prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]))
  }

  const handleToggleSelectAllPeserta = () => {
    const filteredIds = filteredPeserta.map((p) => p.id)
    if (!filteredIds.length) return
    const allSelected = filteredIds.every((id) => selectedPesertaIds.includes(id))
    if (allSelected) {
      setSelectedPesertaIds((prev) => prev.filter((pid) => !filteredIds.includes(pid)))
    } else {
      setSelectedPesertaIds((prev) => Array.from(new Set([...prev, ...filteredIds])))
    }
  }

  const handleBulkDeletePeserta = () => {
    if (!selectedPesertaIds.length) return
    openConfirm({
      title: "Hapus Peserta Terpilih?",
      description: `Anda akan menghapus ${selectedPesertaIds.length} peserta sekaligus.`,
      onConfirm: async () => {
        await apiPost("/api/admin/peserta", { action: "bulkDelete", data: { ids: selectedPesertaIds } })
        setSelectedPesertaIds([])
        onReset()
        toast.success(`${selectedPesertaIds.length} peserta berhasil dihapus`)
      },
    })
  }

  const handleBulkDownloadQR = async () => {
    const selected = filteredPeserta.filter((p) => selectedPesertaIds.includes(p.id))
    if (selected.length === 0) return
    try {
      const sheets = await generateA4Sheets(selected)
      for (let i = 0; i < sheets.length; i++) {
        const link = document.createElement("a")
        link.href = sheets[i]
        link.download = `QR_A4_halaman_${i + 1}.png`
        link.click()
        await new Promise((r) => setTimeout(r, 200))
      }
      toast.success(`Mendownload ${sheets.length} lembar A4 (${selected.length} QR Code)`)
    } catch { toast.error("Gagal membuat lembar QR") }
  }

  const generateQRCode = async (peserta: Peserta, action: "download" | "view") => {
    try {
      const url = await generateQrCodeUrl(peserta.NIB, peserta.NamaPeserta)
      if (action === "download") {
        const link = document.createElement("a")
        link.href = url
        link.download = `QR_${peserta.NamaPeserta}_${peserta.NIB}.png`
        link.click()
      } else {
        setQrCodeUrl(url)
        setViewQrPeserta(peserta)
      }
    } catch { toast.error("Gagal membuat QR Code") }
  }

  const downloadTemplate = () => {
    const headers = "Nama,NIB,Pimpinan\n"
    const sample = "Ahmad Dahlan,20.07.94889,Pimpinan Cabang Sangatta Utara\nSiti Walidah,20.07.94890,Pimpinan Cabang Sangatta Selatan"
    const blob = new Blob([headers + sample], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = "template_peserta.csv"; a.click()
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string
        const lines = text.split(/\r?\n/).filter((ln) => ln.trim().length > 0)
        if (lines.length < 2) { toast.error("File kosong"); return }
        const detectDelimiter = (line: string) => {
          const commaCount = (line.match(/,/g) || []).length
          const semiCount = (line.match(/;/g) || []).length
          return semiCount > commaCount ? ";" : ","
        }
        const delimiter = detectDelimiter(lines[0])
        const headers = lines[0].split(delimiter).map((h) => h.trim().toLowerCase())
        const findIdx = (...keys: string[]) => headers.findIndex((h) => keys.some((k) => h.includes(k.toLowerCase())))
        const idxNama = findIdx("nama")
        const idxNIB = findIdx("nib", "no induk", "no_induk", "id")
        const idxPimpinan = findIdx("pimpinan", "jabatan", "posisi")
        const defaultOffset = headers[0]?.match(/^no\b/i) ? 1 : 0
        const items: { Nama: string; Pimpinan: string; NIB: string }[] = []
        let count = 0
        const invalidRows: string[] = []
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue
          const cols = line.split(delimiter).map((v) => v.replace(/^"(.*)"$/, "$1").trim())
          const Nama = idxNama >= 0 ? cols[idxNama] : cols[defaultOffset] || ""
          let NIB = idxNIB >= 0 ? cols[idxNIB] : cols[defaultOffset + 1] || ""
          let Pimpinan = idxPimpinan >= 0 ? cols[idxPimpinan] : cols[defaultOffset + 2] || ""
          if (!/^\d{2}\.\d{2}\.\d{5}$/.test(NIB)) { NIB = `20.07.${String(90000 + count + i).slice(-5)}` }
          if (!Pimpinan) Pimpinan = "-"
          const parsed = pesertaSchema.safeParse({ Nama, Pimpinan, NIB })
          if (!parsed.success) { invalidRows.push(`Baris ${i + 1}: ${parsed.error.errors[0]?.message || "Data tidak valid"}`); continue }
          items.push({ Nama: parsed.data.Nama, Pimpinan: parsed.data.Pimpinan, NIB: parsed.data.NIB })
          count++
        }
        if (items.length === 0) { toast.error("Tidak ada data valid untuk diimport"); return }
        await apiPost("/api/admin/peserta", { action: "bulkImport", data: { items } })
        toast.success(`Berhasil import ${count} data peserta!${invalidRows.length ? `\nLewati ${invalidRows.length} baris bermasalah.` : ""}`)
        if (invalidRows.length) console.warn("Baris CSV invalid:", invalidRows.join("\n"))
        onReset()
      } catch { toast.error("Gagal import file. Pastikan format CSV benar.") }
      finally { if (fileInputRef.current) fileInputRef.current.value = "" }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Sidebar - Forms */}
        <div className="xl:col-span-1 space-y-6">
          {/* Import CSV */}
          <Card className="border-stone-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                <CardTitle className="text-stone-800 text-sm">Import CSV</CardTitle>
              </div>
              <CardDescription>Upload file Excel (.csv)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full" onClick={downloadTemplate}>
                <Download className="w-4 h-4 mr-2" /> Download Template
              </Button>
              <div className="relative">
                <input type="file" accept=".csv" ref={fileInputRef}
                  onChange={handleFileUpload} className="hidden" id="file-upload" />
                <Label htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer hover:bg-stone-50 transition-colors border-stone-300">
                  <FileSpreadsheet className="w-6 h-6 text-stone-400 mb-1.5" />
                  <span className="text-xs text-stone-500">Klik untuk Upload CSV</span>
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Input Manual */}
          <Card className="border-stone-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-stone-800 text-sm">Input Manual</CardTitle>
              <CardDescription>Tambah peserta satu per satu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Nama Lengkap" value={newPeserta.Nama}
                onChange={(e) => setNewPeserta({ ...newPeserta, Nama: e.target.value })} maxLength={80} />
              <Input placeholder="NIB (contoh: 20.07.94889)" value={newPeserta.NIB}
                onChange={(e) => setNewPeserta({ ...newPeserta, NIB: e.target.value })} maxLength={15} />
              <Input placeholder="Pimpinan (contoh: Pimpinan Cabang Sangatta Utara)" value={newPeserta.Pimpinan}
                onChange={(e) => setNewPeserta({ ...newPeserta, Pimpinan: e.target.value })} maxLength={100} />
              <Button onClick={handleAddPeserta} className="w-full bg-emerald-700 hover:bg-emerald-800">
                <Plus className="w-4 h-4 mr-2" /> Simpan Peserta
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Peserta Table */}
        <div className="xl:col-span-3">
          <Card className="border-stone-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-stone-800 text-sm">Data Peserta</CardTitle>
                  <CardDescription>
                    {filteredPeserta.length} dari {pesertaTotalCount || pesertaList.length} peserta
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 min-w-0 sm:flex-none sm:w-48">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                    <Input placeholder="Cari nama / NIB" value={pesertaSearch}
                      onChange={(e) => setPesertaSearch(e.target.value)}
                      className="w-full h-9 pl-8 pr-7" />
                    {pesertaSearch && (
                      <button onClick={() => setPesertaSearch("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-0.5">
                    <button onClick={() => setViewMode("table")}
                      className={`p-1.5 rounded-md transition-colors ${viewMode === "table" ? "bg-white shadow-sm text-stone-800" : "text-stone-400 hover:text-stone-600"}`}>
                      <List className="h-4 w-4" />
                    </button>
                    <button onClick={() => setViewMode("card")}
                      className={`p-1.5 rounded-md transition-colors ${viewMode === "card" ? "bg-white shadow-sm text-stone-800" : "text-stone-400 hover:text-stone-600"}`}>
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {pesertaLoading && pesertaList.length === 0 ? (
                <LoadingSkeleton variant="table" count={5} />
              ) : filteredPeserta.length === 0 ? (
                <div className="px-6 pb-6">
                  <EmptyState icon={FileSpreadsheet} title="Tidak ada data peserta"
                    description={pesertaSearch
                      ? "Tidak ada peserta yang cocok dengan pencarian."
                      : "Belum ada data peserta. Tambahkan melalui form atau import CSV."} />
                </div>
              ) : viewMode === "table" ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                         <TableHead className="w-10">
                           <label className="inline-flex items-center justify-center p-1.5 -m-1.5 cursor-pointer">
                             <input type="checkbox" className="h-5 w-5 rounded border-stone-300 accent-emerald-600"
                               checked={filteredPeserta.length > 0 && filteredPeserta.every((p) => selectedPesertaIds.includes(p.id))}
                               onChange={handleToggleSelectAllPeserta} disabled={!filteredPeserta.length} />
                           </label>
                         </TableHead>
                        <TableHead className="text-stone-600">NIB</TableHead>
                        <TableHead className="text-stone-600">Nama</TableHead>
                        <TableHead className="text-stone-600">Pimpinan</TableHead>
                        <TableHead className="text-stone-600">Status</TableHead>
                        <TableHead className="text-right text-stone-600">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPeserta.map((p) => (
                        <TableRow key={p.id}>
                           <TableCell>
                             <label className="inline-flex items-center justify-center p-1.5 -m-1.5 cursor-pointer">
                               <input type="checkbox" className="h-5 w-5 rounded border-stone-300 accent-emerald-600"
                                 checked={selectedPesertaIds.includes(p.id)}
                                 onChange={() => handleToggleSelectPeserta(p.id)} />
                             </label>
                           </TableCell>
                          <TableCell className="font-mono text-xs">{p.NIB || "—"}</TableCell>
                          <TableCell className="text-stone-800 font-medium">{p.NamaPeserta}</TableCell>
                          <TableCell className="text-stone-600">{p.Pimpinan}</TableCell>
                          <TableCell><StatusBadge status={p.StatusVoting} /></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="outline" size="icon" className="h-9 w-9 shrink-0"
                                 onClick={() => generateQRCode(p, "view")} title="Lihat QR">
                                 <Eye className="h-3.5 w-3.5" />
                               </Button>
                               <Button variant="outline" size="icon" className="h-9 w-9 shrink-0"
                                 onClick={() => generateQRCode(p, "download")} title="Download QR">
                                 <Download className="h-3.5 w-3.5" />
                               </Button>
                               <Dialog>
                                 <DialogTrigger asChild>
                                   <Button variant="outline" size="icon" className="h-9 w-9 shrink-0"
                                     onClick={() => setEditingPeserta(p)}>
                                     <Pencil className="h-3.5 w-3.5" />
                                   </Button>
                                </DialogTrigger>
                                {editingPeserta && (
                                  <DialogContent>
                                    <DialogHeader><DialogTitle>Edit Data Peserta</DialogTitle></DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <Label className="text-xs text-stone-600">Nama Peserta</Label>
                                        <Input value={editingPeserta.NamaPeserta}
                                          onChange={(e) => setEditingPeserta({ ...editingPeserta, NamaPeserta: e.target.value })} />
                                      </div>
                                      <div className="space-y-2">
                                        <Label className="text-xs text-stone-600">NIB</Label>
                                        <Input value={editingPeserta.NIB}
                                          onChange={(e) => setEditingPeserta({ ...editingPeserta, NIB: e.target.value })} />
                                      </div>
                                      <div className="space-y-2">
                                        <Label className="text-xs text-stone-600">Pimpinan</Label>
                                        <Input value={editingPeserta.Pimpinan}
                                          onChange={(e) => setEditingPeserta({ ...editingPeserta, Pimpinan: e.target.value })} />
                                      </div>
                                      <Button onClick={handleEditPeserta} className="w-full">Simpan Perubahan</Button>
                                    </div>
                                  </DialogContent>
                                )}
                              </Dialog>
                               <Button variant="destructive" size="icon" className="h-9 w-9 shrink-0"
                                 onClick={() => handleDeletePeserta(p.id)}>
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
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
                   {filteredPeserta.map((p) => (
                     <div key={p.id} className="rounded-xl border border-stone-200 bg-white p-4 space-y-3">
                       <div className="flex items-start justify-between gap-2">
                         <div className="space-y-1 min-w-0 flex-1">
                           <p className="text-sm font-semibold text-stone-800 truncate">{p.NamaPeserta}</p>
                           <p className="font-mono text-xs text-stone-500">{p.NIB || "—"}</p>
                           <p className="text-xs text-stone-600 truncate">{p.Pimpinan}</p>
                         </div>
                         <label className="inline-flex items-center justify-center p-1.5 -m-1.5 cursor-pointer shrink-0">
                           <input type="checkbox" className="h-5 w-5 rounded border-stone-300 accent-emerald-600"
                             checked={selectedPesertaIds.includes(p.id)}
                             onChange={() => handleToggleSelectPeserta(p.id)} />
                         </label>
                       </div>
                       <div className="flex items-center justify-between">
                         <StatusBadge status={p.StatusVoting} />
                         <div className="flex items-center gap-1">
                           <Button variant="outline" size="icon" className="h-9 w-9 shrink-0"
                             onClick={() => generateQRCode(p, "view")} title="Lihat QR">
                             <Eye className="h-3.5 w-3.5" />
                           </Button>
                           <Button variant="outline" size="icon" className="h-9 w-9 shrink-0"
                             onClick={() => generateQRCode(p, "download")} title="Download QR">
                             <Download className="h-3.5 w-3.5" />
                           </Button>
                           <Button variant="outline" size="icon" className="h-9 w-9 shrink-0"
                             onClick={() => setEditingPeserta(p)}>
                             <Pencil className="h-3.5 w-3.5" />
                           </Button>
                           <Button variant="destructive" size="icon" className="h-9 w-9 shrink-0"
                             onClick={() => handleDeletePeserta(p.id)}>
                             <Trash2 className="h-3.5 w-3.5" />
                           </Button>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </CardContent>
            {!pesertaLoading && pesertaList.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-3 border-t border-stone-100">
                <span className="text-xs text-stone-500">
                  {pesertaLoading ? "Memuat..." : `Menampilkan ${pesertaList.length} dari ${pesertaTotalCount || pesertaList.length} peserta`}
                </span>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={onReset} disabled={pesertaLoading}>
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Muat Ulang
                  </Button>
                  <Button variant="outline" size="sm" onClick={onLoadMore} disabled={!pesertaHasMore || pesertaLoading}>
                    {pesertaHasMore ? "Muat 10 Lagi" : "Semua Data Dimuat"}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <BulkActionBar
        selectedCount={selectedPesertaIds.length}
        onClear={() => setSelectedPesertaIds([])}
        onDelete={handleBulkDeletePeserta}
        onDownloadQR={handleBulkDownloadQR}
      />

      <Dialog open={!!editingPeserta} onOpenChange={(open) => !open && setEditingPeserta(null)}>
        {editingPeserta && (
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Data Peserta</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-xs text-stone-600">Nama Peserta</Label>
                <Input value={editingPeserta.NamaPeserta}
                  onChange={(e) => setEditingPeserta({ ...editingPeserta, NamaPeserta: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-stone-600">NIB</Label>
                <Input value={editingPeserta.NIB}
                  onChange={(e) => setEditingPeserta({ ...editingPeserta, NIB: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-stone-600">Pimpinan</Label>
                <Input value={editingPeserta.Pimpinan}
                  onChange={(e) => setEditingPeserta({ ...editingPeserta, Pimpinan: e.target.value })} />
              </div>
              <Button onClick={handleEditPeserta} className="w-full">Simpan Perubahan</Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <ConfirmDialog open={confirmState.open} title={confirmState.title}
        description={confirmState.description} onConfirm={confirmState.onConfirm} onClose={closeConfirm} />
      <QrCodeDialog peserta={viewQrPeserta} qrCodeUrl={qrCodeUrl}
        onDownload={(p) => generateQRCode(p, "download")} onClose={() => setViewQrPeserta(null)} />
    </div>
  )
}
