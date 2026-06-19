import { collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function logError(title: string, errorMsg: string) {
  try {
    const now = new Date()
    await addDoc(collection(db, "error"), {
      tanggal: now.toLocaleString("id-ID", { dateStyle: "full", timeStyle: "long" }),
      judul: title,
      IsiError: errorMsg,
      timestamp: now,
    })
  } catch (e) {
    console.error("Failed to log error", e)
  }
}

export function getCameraErrorMessage(err: unknown) {
  const name = (err as any)?.name || ""
  const message = (err as any)?.message || ""

  if (name === "NotAllowedError" || name === "SecurityError") {
    const isHttp = typeof window !== "undefined" && window.location.protocol === "http:"
    if (isHttp) {
      return "Koneksi tidak aman (HTTP). Akses kamera hanya tersedia melalui HTTPS. Hubungi administrator."
    }
    const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent)
    if (isIOS) {
      return "Akses kamera diblokir. Buka Pengaturan > Safari > Kamera, setel ke 'Izinkan'. Atau buka Pengaturan > [Nama App] > Kamera, setel ke 'Izinkan'."
    }
    return "Akses kamera diblokir oleh browser. Buka ikon gembok 🔒 di bilah alamat, setel izin kamera ke 'Diizinkan', lalu refresh halaman."
  }

  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return "Perangkat kamera tidak ditemukan atau tidak tersedia. Pastikan kamera tersambung dan tidak sedang dipakai aplikasi lain."
  }

  if (name === "NotReadableError") {
    return "Kamera sedang dipakai aplikasi lain. Tutup aplikasi yang memakai kamera lalu coba lagi."
  }

  if (message?.toLowerCase?.().includes("not supported") || message?.toLowerCase?.().includes("could not start")) {
    return "Browser tidak mendukung akses kamera. Gunakan Chrome atau Safari versi terbaru."
  }

  return `Gagal membuka kamera. ${message || "Periksa pengaturan browser Anda lalu refresh halaman."}`
}
