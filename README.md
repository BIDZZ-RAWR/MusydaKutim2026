# E-Voting Musyda IPM Kutai Timur 2025

Sistem E-Voting untuk pemilihan Formatur IPM (Ikatan Pelajar Muhammadiyah) — Musyran Pimpinan Cabang IPM Kutai Timur.

## Fitur

- **Landing Page** — Statistik voting real-time, grid kandidat, grafik perolehan suara, dan pengumuman pemenang
- **Dashboard Admin** — CRUD data peserta & calon formatur, upload foto via Cloudinary, bulk actions, QR Code generator, dan pantau hasil voting
- **Dashboard Panitia** — Monitoring bilik suara per panitia, scanner QR Code untuk verifikasi pemilih
- **Mode Monitor** — Tampilan real-time Antrian & pemilih yang sudah memilih
- **Mode Darurat** — Input suara manual jika terjadi kendala teknis
- **Autentikasi & Session** — Login/logout aman dengan iron-session + bcryptjs
- **Real-time Updates** — Sinkronisasi data voting real-time via Firebase Firestore

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [Firebase Firestore](https://firebase.google.com/)
- **Autentikasi**: [iron-session](https://github.com/vvo/iron-session), [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Form & Validasi**: [react-hook-form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **QR Code**: [html5-qrcode](https://github.com/mebjas/html5-qrcode) (scanner), [qrcode](https://github.com/soldair/node-qrcode) (generator)
- **Charts**: [Recharts](https://recharts.org/)
- **Image Management**: [Cloudinary](https://cloudinary.com/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Netlify](https://www.netlify.com/)

## Struktur Folder

```
├── app/
│   ├── admin/dashboard/       # Dashboard admin + komponen CRUD
│   ├── api/auth/              # API routes (login, logout, me)
│   ├── darurat/               # Mode voting darurat
│   ├── hooks/                 # Hook landing page
│   ├── layout.tsx             # Root layout (Header + Footer)
│   ├── login/                 # Halaman login
│   ├── page.tsx               # Landing page
│   └── panitia/[id]/          # Dashboard & monitor per bilik
├── components/
│   ├── landing/               # HeroStats, CandidatesGrid, ChartSection, WinnerSection
│   ├── layout/                # Header, Footer
│   ├── login/                 # ModeSelectionDialog
│   ├── monitor/               # CandidateCard, VoterHeader, VoteActionBar
│   ├── panitia/               # CameraControls, ScannerSection, ManualInput
│   └── ui/                    # shadcn/ui components (button, card, dialog, dsb.)
├── hooks/                     # Global hooks (use-toast)
├── lib/
│   ├── firebase.ts            # Firebase client config
│   ├── firebase-admin.ts      # Firebase Admin SDK
│   ├── logger.ts              # Logger utility
│   ├── session.ts             # iron-session config
│   ├── utils.ts               # Utility functions
│   └── validation.ts          # Zod validation schemas
├── public/images/             # Asset gambar (logo.png)
├── scripts/
│   └── migrate-passwords.mjs  # Script migrasi password
├── .env.example               # Contoh environment variables
├── netlify.toml               # Konfigurasi deployment Netlify
└── rules.json                 # Aturan keamanan Firestore
```

## Instalasi

```bash
# Clone repository
git clone https://github.com/username/musyran2025.git
cd musyran2025

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Environment Variables

Salin `.env.example` menjadi `.env.local` dan isi nilai-nilai yang diperlukan:

```bash
cp .env.example .env.local
```

| Variable | Deskripsi |
|---|---|
| `NEXT_PUBLIC_FIREBASE_*` | Konfigurasi Firebase Client SDK (aman dipublikasikan) |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Service account email untuk Firebase Admin SDK |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Private key service account Firebase |
| `SESSION_SECRET` | Kunci rahasia untuk enkripsi session (min. 32 karakter) |
| `CLOUDINARY_CLOUD_NAME` | Cloud name Cloudinary |
| `CLOUDINARY_API_KEY` | API Key Cloudinary |
| `CLOUDINARY_API_SECRET` | API Secret Cloudinary |

> **Penting:** `.env.local` sudah masuk `.gitignore` dan tidak akan ter-push. Jangan pernah membagikan nilai sebenarnya dari environment variables.

## Scripts

```bash
npm run dev      # Development server (http://localhost:3000)
npm run build    # Build production
npm run start    # Start production server
npm run lint     # Linting (ESLint)
```

## Lisensi

© 2025 Musyda IPM Kutai Timur — SMK Muhammadiyah 1 Sangatta Utara

Dibuat dengan 🤍 oleh Muhammad Abid
