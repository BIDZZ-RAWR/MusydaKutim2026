"use client"

import { useEffect, useState } from "react"
import { Users, ClipboardList, UserPlus, Globe } from "lucide-react"

interface SummaryCardData {
  title: string
  subtitle: string
  icon: typeof Users
  gradient: string
  iconBg: string
}

const cards: SummaryCardData[] = [
  {
    title: "Panitia",
    subtitle: "Akun aktif",
    icon: Users,
    gradient: "from-violet-500/10 to-violet-600/5",
    iconBg: "bg-violet-50 text-violet-600",
  },
  {
    title: "Data Peserta",
    subtitle: "Terdaftar DPT",
    icon: ClipboardList,
    gradient: "from-emerald-500/10 to-emerald-600/5",
    iconBg: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Calon Formatur",
    subtitle: "Kandidat aktif",
    icon: UserPlus,
    gradient: "from-amber-500/10 to-amber-600/5",
    iconBg: "bg-amber-50 text-amber-600",
  },
  {
    title: "Landing Views",
    subtitle: "Total kunjungan",
    icon: Globe,
    gradient: "from-sky-500/10 to-sky-600/5",
    iconBg: "bg-sky-50 text-sky-600",
  },
]

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (value === 0) { setDisplay(0); return }
    const duration = 800
    const steps = 30
    const increment = value / steps
    let current = 0
    let step = 0
    const timer = setInterval(() => {
      step++
      current = Math.min(Math.round(increment * step), value)
      setDisplay(current)
      if (step >= steps) clearInterval(timer)
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value])

  return <>{display.toLocaleString()}</>
}

interface SummaryCardsProps {
  panitiaCount: number
  pesertaCount: number
  candidateCount: number
  viewCount: number
}

export function SummaryCards({ panitiaCount, pesertaCount, candidateCount, viewCount }: SummaryCardsProps) {
  const values = [panitiaCount, pesertaCount, candidateCount, viewCount]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon
        return (
          <div
            key={card.title}
            className="group relative rounded-2xl border border-stone-200 bg-white p-5 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative flex items-start justify-between">
              <div className="space-y-1.5">
                <p className="text-[11px] uppercase tracking-[0.12em] text-stone-500 font-medium">{card.subtitle}</p>
                <div className="text-2xl font-bold text-stone-900 tabular-nums">
                  <AnimatedNumber value={values[i]} />
                </div>
                <p className="text-sm text-stone-600">{card.title}</p>
              </div>
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-black/5 ${card.iconBg}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
