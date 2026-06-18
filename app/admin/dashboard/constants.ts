import { z } from "zod"
import type { NavItem, RoleOption } from "./types"
import { sanitizeText } from "@/lib/utils"

export const ROLE_OPTIONS: RoleOption[] = [
  { key: "ketuaUmum", label: "Ketua Umum" },
  { key: "sekretarisUmum", label: "Sekretaris Umum" },
  { key: "bendaharaUmum", label: "Bendahara Umum" },
  { key: "ketuaOrganisasi", label: "Ketua Bidang Organisasi" },
  { key: "ketuaPerkaderan", label: "Ketua Bidang Perkaderan" },
  { key: "ketuaKDI", label: "Ketua Bidang KDI" },
  { key: "ketuaASBO", label: "Ketua Bidang ASBO" },
]

export const NAV_ITEMS: NavItem[] = [
  { value: "overview", label: "Ringkasan" },
  { value: "panitia", label: "Manajemen Panitia" },
  { value: "peserta", label: "Manajemen Peserta" },
  { value: "calon", label: "Calon Formatur" },
  { value: "landing", label: "Landing Page" },
]

export const PESERTA_PAGE_SIZE = 10

export const DEFAULT_LANDING_CONTENT = {
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
  chartYAxisLabel: "Jumlah Suara",
  loginLinkText: "LOGIN PANITIA / ADMIN",
  footerMadeBy: "Dibuat dengan 🤍 oleh Muhammad Abid",
  footerCopyright: "© 2025 Musyran IPM",
}

export const labelToKey = (label: string) => {
  const found = ROLE_OPTIONS.find((r) => r.label.toLowerCase() === label.toLowerCase())
  return found?.key
}

const textContent = (label: string, max = 120) =>
  z
    .string()
    .trim()
    .min(1, `${label} wajib diisi`)
    .max(max, `${label} maksimal ${max} karakter`)
    .transform((val) => sanitizeText(val, max))

const colorSchema = z
  .string()
  .trim()
  .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Warna harus memakai format hex (#RRGGBB)")

const sizeSchema = (label: string) =>
  z
    .string()
    .trim()
    .refine((val) => {
      const num = Number(val)
      return !Number.isNaN(num) && num >= 0 && num <= 100
    }, `${label} harus berupa angka yang valid`)

export const emailOrUsernameSchema = z
  .string()
  .trim()
  .min(3, "Email/username wajib diisi")
  .max(120, "Email/username terlalu panjang")
  .refine(
    (val) => {
      if (val.includes("@")) return z.string().email().safeParse(val).success
      return /^[a-zA-Z0-9._-]{3,50}$/.test(val)
    },
    "Gunakan format email atau username alfanumerik",
  )

export const passwordSchema = z.string().min(8, "Password minimal 8 karakter").max(64, "Password maksimal 64 karakter")

export const panitiaSchema = z.object({
  email: emailOrUsernameSchema,
  password: passwordSchema,
})

export const bilikSchema = z
  .object({
    id: z.string().trim().regex(/^\d{1,3}$/, "ID bilik harus berupa angka 1-3 digit"),
    name: z.string().optional().transform((val) => sanitizeText(val || "", 60)),
    monitor: z.string().optional().transform((val) => sanitizeText(val || "", 60)),
    email: z.string().optional().transform((val) => (val ? val.trim() : "")),
    handphone: z.string().optional().transform((val) => sanitizeText(val || "", 30)),
  })
  .refine((data) => !data.email || z.string().email().safeParse(data.email).success, {
    message: "Email bilik tidak valid",
    path: ["email"],
  })
  .refine((data) => !data.handphone || /^[0-9+.\-]{6,18}$/.test(data.handphone), {
    message: "Nomor handphone tidak valid",
    path: ["handphone"],
  })

export const pesertaSchema = z.object({
  Nama: textContent("Nama peserta", 80),
  Pimpinan: textContent("Pimpinan", 100),
  NIB: z.string().trim().regex(/^\d{2}\.\d{2}\.\d{5}$/, "NIB harus format XX.XX.XXXXX (contoh: 20.07.94889)"),
})

export const candidateSchema = z.object({
  id: z.string().trim().regex(/^[A-Za-z0-9]{1,4}$/, "ID hanya boleh huruf/angka (1-4 karakter)"),
  name: textContent("Nama calon", 80),
  photo: z.string().url("URL foto tidak valid, pastikan foto sudah terunggah"),
})

export const candidateUpdateSchema = z.object({
  id: z.string(),
  newId: z
    .string()
    .trim()
    .min(1, "Nomor urut wajib diisi")
    .regex(/^[A-Za-z0-9]{1,4}$/, "ID hanya boleh huruf/angka (1-4 karakter)"),
  NamaCalonFormatur: textContent("Nama calon", 80),
  FotoCalonFormatur: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val ? val : ""))
    .refine((val) => !val || z.string().url().safeParse(val).success, "URL foto tidak valid"),
})

export const landingContentSchema = z.object({
  winnerTitle: textContent("Judul formatur terpilih", 80),
  winnerSubtitle: textContent("Subjudul formatur terpilih", 120),
  winnerHeadingColor: colorSchema,
  winnerHeadingSize: sizeSchema("Ukuran judul formatur"),
  winnerSubColor: colorSchema,
  winnerSubSize: sizeSchema("Ukuran subjudul formatur"),
  totalLabel: textContent("Label total", 60),
  totalSub: textContent("Sub label total", 60),
  votedLabel: textContent("Label sudah memilih", 60),
  notVotedLabel: textContent("Label belum memilih", 60),
  notVotedSuffix: textContent("Suffix belum memilih", 40),
  candidateSectionTitle: textContent("Judul section calon", 80),
  candidateSectionTitleColor: colorSchema,
  candidateSectionTitleSize: sizeSchema("Ukuran judul section"),
  candidateSubtitle: textContent("Subjudul calon", 80),
  candidateSubtitleColor: colorSchema,
  candidateSubtitleSize: sizeSchema("Ukuran subjudul calon"),
  candidateBadgePrefix: textContent("Prefix badge", 20),
  candidateBadgeBgColor: colorSchema,
  candidateBadgeTextColor: colorSchema,
  candidateBadgeFontSize: sizeSchema("Ukuran badge"),
  candidateBadgeShape: z.enum(["rounded", "square"]),
  candidateBadgeTextTransform: z.enum(["none", "uppercase", "capitalize"]),
  candidateBadgeShadow: z.boolean(),
  chartTitle: textContent("Judul chart", 80),
  chartTitleColor: colorSchema,
  chartTitleSize: sizeSchema("Ukuran judul chart"),
  chartYAxisLabel: textContent("Label Y chart", 40),
  loginLinkText: textContent("Teks login", 80),
  footerMadeBy: textContent("Footer made by", 80),
  footerCopyright: textContent("Footer copyright", 80),
})

export const parseWithFeedback = <T,>(schema: z.ZodSchema<T>, payload: unknown, fallbackMessage = "Data tidak valid") => {
  const result = schema.safeParse(payload)
  if (!result.success) {
    const message = result.error.errors.map((e) => e.message).join("\n")
    return null
  }
  return result.data
}
