"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe, ChevronDown, ChevronRight, Eye, EyeOff } from "lucide-react"
import type { LandingContent, LandingStatus, RolesMap, RoleLabels, Candidate } from "../types"
import { ROLE_OPTIONS } from "../constants"

interface LandingTabProps {
  landingContent: LandingContent
  landingStatus: LandingStatus
  rolesMap: RolesMap
  roleLabels: RoleLabels
  candidateList: Candidate[]
  savingLanding: boolean
  onContentChange: (key: string, value: string | boolean) => void
  onStatusChange: (key: "utama" | "winner", value: boolean) => void
  onRoleChange: (roleKey: string, candidateId: string) => void
  onLabelChange: (roleKey: string, label: string) => void
  onSaveAll: () => void
}

const COLOR_SWATCHES = [
  "#166534", "#15803d", "#16a34a", "#22c55e", "#14532d",
  "#1e293b", "#334155", "#475569", "#0f172a",
  "#7c3aed", "#6d28d9", "#5b21b6",
  "#b91c1c", "#dc2626", "#ef4444",
  "#d97706", "#f59e0b", "#fbbf24",
]

function CollapsibleSection({
  title,
  description,
  defaultOpen = true,
  children,
}: {
  title: string
  description?: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Card className="border-stone-200 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 sm:p-6 text-left"
      >
        <div>
          <CardTitle className="text-stone-800 text-sm flex items-center gap-2">
            {open ? <ChevronDown className="h-4 w-4 text-stone-400" /> : <ChevronRight className="h-4 w-4 text-stone-400" />}
            {title}
          </CardTitle>
          {description && <CardDescription className="ml-6">{description}</CardDescription>}
        </div>
      </button>
      {open && <CardContent className="px-4 sm:px-6 pb-6 pt-0">{children}</CardContent>}
    </Card>
  )
}

function ColorInput({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (v: string) => void
  label: string
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-stone-600">{label}</Label>
      <div className="flex gap-2 items-center">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-9 rounded-lg border border-stone-200 cursor-pointer bg-transparent p-0.5"
          />
        </div>
        <Input value={value} onChange={(e) => onChange(e.target.value)}
          className="font-mono text-xs h-9" />
        <div className="flex gap-1">
          {COLOR_SWATCHES.slice(0, 5).map((swatch) => (
            <button
              key={swatch}
              type="button"
              onClick={() => onChange(swatch)}
              className={`h-6 w-6 rounded-full border-2 transition-all hover:scale-110 ${
                value === swatch ? "border-stone-800 scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: swatch }}
              aria-label={`Warna ${swatch}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function LandingTab({
  landingContent,
  landingStatus,
  rolesMap,
  roleLabels,
  candidateList,
  savingLanding,
  onContentChange,
  onStatusChange,
  onRoleChange,
  onLabelChange,
  onSaveAll,
}: LandingTabProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Visibilitas */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 border-stone-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-stone-800 text-sm">Visibilitas Landing</CardTitle>
            <CardDescription>Aktifkan atau sembunyikan halaman landing & formatur terpilih</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ToggleCard
              label="Landing Page Utama"
              description="Halaman publik utama"
              checked={landingStatus.utama}
              onChange={(v) => onStatusChange("utama", v)}
            />
            <ToggleCard
              label="Halaman Formatur Terpilih"
              description="Tampilkan hasil akhir"
              checked={landingStatus.winner}
              onChange={(v) => onStatusChange("winner", v)}
            />
          </CardContent>
        </Card>

        <Card className="border-stone-200 shadow-sm bg-gradient-to-br from-emerald-50/50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-stone-800 text-sm">
              <Globe className="h-4 w-4 text-emerald-600" />
              Status Landing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-stone-600">Landing</span>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ring-1 ring-inset ${
                landingStatus.utama ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" : "bg-stone-100 text-stone-600 ring-stone-500/20"
              }`}>
                {landingStatus.utama ? "Aktif" : "Nonaktif"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-600">Formatur</span>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ring-1 ring-inset ${
                landingStatus.winner ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" : "bg-stone-100 text-stone-600 ring-stone-500/20"
              }`}>
                {landingStatus.winner ? "Aktif" : "Nonaktif"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Mapping - Collapsible */}
      <CollapsibleSection title="Halaman Formatur Terpilih" description="Pilih siapa yang tampil untuk tiap jabatan.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ROLE_OPTIONS.map((role) => (
            <div className="space-y-2 rounded-xl border border-stone-200 p-4" key={role.key}>
              <div className="space-y-1">
                <Label className="text-xs text-stone-600">Label Jabatan</Label>
                <Input value={roleLabels[role.key] || role.label}
                  onChange={(e) => onLabelChange(role.key, e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-stone-600">Pilih Calon</Label>
                <Select value={rolesMap[role.key] || ""}
                  onValueChange={(val) => onRoleChange(role.key, val)}>
                  <SelectTrigger><SelectValue placeholder="Pilih calon" /></SelectTrigger>
                  <SelectContent>
                    {candidateList.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.id} — {c.NamaCalonFormatur}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Stats Labels */}
      <CollapsibleSection title="Label Statistik" description="Edit teks di kartu statistik landing page.">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-stone-600">Total Peserta</Label>
            <Input value={landingContent.totalLabel} onChange={(e) => onContentChange("totalLabel", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-stone-600">Subtotal</Label>
            <Input value={landingContent.totalSub} onChange={(e) => onContentChange("totalSub", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-stone-600">Sudah Memilih</Label>
            <Input value={landingContent.votedLabel} onChange={(e) => onContentChange("votedLabel", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-stone-600">Belum Memilih</Label>
            <Input value={landingContent.notVotedLabel} onChange={(e) => onContentChange("notVotedLabel", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-stone-600">Suffix Belum Memilih</Label>
            <Input value={landingContent.notVotedSuffix} onChange={(e) => onContentChange("notVotedSuffix", e.target.value)} />
          </div>
        </div>
      </CollapsibleSection>

      {/* Section Labels */}
      <CollapsibleSection title="Label Bagian Landing" description="Judul section kandidat dan chart.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label className="text-xs text-stone-600">Judul Section Kandidat</Label>
            <Input value={landingContent.candidateSectionTitle} onChange={(e) => onContentChange("candidateSectionTitle", e.target.value)} />
            <ColorInput label="Warna Judul" value={landingContent.candidateSectionTitleColor}
              onChange={(v) => onContentChange("candidateSectionTitleColor", v)} />
            <div className="space-y-1.5">
              <Label className="text-xs text-stone-600">Ukuran Judul (rem)</Label>
              <Input type="number" step="0.1" min="0" value={landingContent.candidateSectionTitleSize}
                onChange={(e) => onContentChange("candidateSectionTitleSize", e.target.value)} />
            </div>
          </div>
          <div className="space-y-3">
            <Label className="text-xs text-stone-600">Subjudul Kandidat</Label>
            <Input value={landingContent.candidateSubtitle} onChange={(e) => onContentChange("candidateSubtitle", e.target.value)} />
            <ColorInput label="Warna Subjudul" value={landingContent.candidateSubtitleColor}
              onChange={(v) => onContentChange("candidateSubtitleColor", v)} />
            <div className="space-y-1.5">
              <Label className="text-xs text-stone-600">Ukuran Subjudul (rem)</Label>
              <Input type="number" step="0.1" min="0" value={landingContent.candidateSubtitleSize}
                onChange={(e) => onContentChange("candidateSubtitleSize", e.target.value)} />
            </div>
          </div>
          <div className="space-y-3">
            <Label className="text-xs text-stone-600">Judul Chart</Label>
            <Input value={landingContent.chartTitle} onChange={(e) => onContentChange("chartTitle", e.target.value)} />
            <ColorInput label="Warna Judul Chart" value={landingContent.chartTitleColor}
              onChange={(v) => onContentChange("chartTitleColor", v)} />
            <div className="space-y-1.5">
              <Label className="text-xs text-stone-600">Ukuran Judul Chart (rem)</Label>
              <Input type="number" step="0.1" min="0" value={landingContent.chartTitleSize}
                onChange={(e) => onContentChange("chartTitleSize", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-600">Label Y Axis</Label>
            <Input value={landingContent.chartYAxisLabel} onChange={(e) => onContentChange("chartYAxisLabel", e.target.value)} />
          </div>
        </div>
      </CollapsibleSection>

      {/* Badge Style */}
      <CollapsibleSection title="Style Badge Calon" description="Atur tampilan chip nomor urut di kartu calon.">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-600">Prefix</Label>
            <Input value={landingContent.candidateBadgePrefix} onChange={(e) => onContentChange("candidateBadgePrefix", e.target.value)} />
          </div>
          <ColorInput label="Warna Badge" value={landingContent.candidateBadgeBgColor}
            onChange={(v) => onContentChange("candidateBadgeBgColor", v)} />
          <ColorInput label="Warna Teks" value={landingContent.candidateBadgeTextColor}
            onChange={(v) => onContentChange("candidateBadgeTextColor", v)} />
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-600">Ukuran Font (rem)</Label>
            <Input type="number" step="0.1" min="0" value={landingContent.candidateBadgeFontSize}
              onChange={(e) => onContentChange("candidateBadgeFontSize", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-600">Bentuk</Label>
            <Select value={landingContent.candidateBadgeShape}
              onValueChange={(val: string) => onContentChange("candidateBadgeShape", val)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="rounded">Rounded</SelectItem>
                <SelectItem value="square">Square</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-600">Transformasi Teks</Label>
            <Select value={landingContent.candidateBadgeTextTransform}
              onValueChange={(val: string) => onContentChange("candidateBadgeTextTransform", val)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Normal</SelectItem>
                <SelectItem value="uppercase">Uppercase</SelectItem>
                <SelectItem value="capitalize">Capitalize</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-600">Shadow</Label>
            <Select value={landingContent.candidateBadgeShadow ? "on" : "off"}
              onValueChange={(val: string) => onContentChange("candidateBadgeShadow", val === "on")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="on">On</SelectItem>
                <SelectItem value="off">Off</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CollapsibleSection>

      {/* Winner & Footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CollapsibleSection title="Halaman Formatur" description="Judul, subjudul, dan gaya teks." defaultOpen={false}>
          <div className="space-y-3">
            <Label className="text-xs text-stone-600">Judul Halaman</Label>
            <Input value={landingContent.winnerTitle} onChange={(e) => onContentChange("winnerTitle", e.target.value)} />
            <ColorInput label="Warna Judul" value={landingContent.winnerHeadingColor}
              onChange={(v) => onContentChange("winnerHeadingColor", v)} />
            <div className="space-y-1.5">
              <Label className="text-xs text-stone-600">Ukuran Judul (rem)</Label>
              <Input type="number" step="0.1" min="0" value={landingContent.winnerHeadingSize}
                onChange={(e) => onContentChange("winnerHeadingSize", e.target.value)} />
            </div>
            <Label className="text-xs text-stone-600">Subjudul</Label>
            <Input value={landingContent.winnerSubtitle} onChange={(e) => onContentChange("winnerSubtitle", e.target.value)} />
            <ColorInput label="Warna Subjudul" value={landingContent.winnerSubColor}
              onChange={(v) => onContentChange("winnerSubColor", v)} />
            <div className="space-y-1.5">
              <Label className="text-xs text-stone-600">Ukuran Subjudul (rem)</Label>
              <Input type="number" step="0.1" min="0" value={landingContent.winnerSubSize}
                onChange={(e) => onContentChange("winnerSubSize", e.target.value)} />
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="CTA & Footer" description="Teks login dan footer." defaultOpen={false}>
          <div className="space-y-3">
            <Label className="text-xs text-stone-600">Teks Login Link</Label>
            <Input value={landingContent.loginLinkText} onChange={(e) => onContentChange("loginLinkText", e.target.value)} />
            <Label className="text-xs text-stone-600">Footer "Made by"</Label>
            <Input value={landingContent.footerMadeBy} onChange={(e) => onContentChange("footerMadeBy", e.target.value)} />
            <Label className="text-xs text-stone-600">Footer Copyright</Label>
            <Input value={landingContent.footerCopyright} onChange={(e) => onContentChange("footerCopyright", e.target.value)} />
          </div>
        </CollapsibleSection>
      </div>

      {/* Save Button */}
      <div className="sticky bottom-4 z-10 flex justify-end">
        <div className="bg-white/80 backdrop-blur-md border border-stone-200 shadow-lg rounded-2xl px-5 py-3">
          <Button onClick={onSaveAll} disabled={savingLanding} className="bg-stone-800 hover:bg-stone-900">
            {savingLanding ? (
              <>Menyimpan...</>
            ) : (
              <>Simpan Semua Perubahan <Globe className="h-4 w-4 ml-2" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

function ToggleCard({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 hover:bg-stone-100 transition-colors">
      <div>
        <p className="text-sm font-semibold text-stone-800">{label}</p>
        <p className="text-xs text-stone-500">{description}</p>
      </div>
      <div
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onClick={() => onChange(!checked)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onChange(!checked) } }}
        className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 ${
          checked ? "bg-emerald-600" : "bg-stone-300"
        }`}
      >
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`} />
      </div>
    </div>
  )
}
