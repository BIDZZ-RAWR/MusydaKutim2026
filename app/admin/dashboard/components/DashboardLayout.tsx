"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Menu, X, LayoutDashboard, Users, ClipboardList, Vote, Globe, LogOut,
} from "lucide-react"
import type { NavItem } from "../types"

const iconMap: Record<string, React.ElementType> = {
  overview: LayoutDashboard,
  panitia: Users,
  peserta: ClipboardList,
  calon: Vote,
  landing: Globe,
}

const labelMap: Record<string, string> = {
  overview: "Ringkasan",
  panitia: "Manajemen Panitia",
  peserta: "Manajemen Peserta",
  calon: "Calon Formatur",
  landing: "Landing Page",
}

interface DashboardLayoutProps {
  children: React.ReactNode
  navItems: NavItem[]
  activeTab: string
  onTabChange: (value: string) => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

export function DashboardLayout({
  children,
  navItems,
  activeTab,
  onTabChange,
  mobileMenuOpen,
  setMobileMenuOpen,
}: DashboardLayoutProps) {
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mobileMenuOpen) return
    const handleKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileMenuOpen(false)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", handleKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener("keydown", handleKey)
    }
  }, [mobileMenuOpen, setMobileMenuOpen])

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-stone-200 z-30">
        <div className="flex items-center gap-3 px-6 h-16 border-b border-stone-100">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            M
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-800 leading-tight">Musyran IPM</p>
            <p className="text-[10px] text-stone-500 tracking-wide uppercase">Dashboard Admin</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = iconMap[item.value] || LayoutDashboard
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onTabChange(item.value)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === item.value
                    ? "bg-emerald-50 text-emerald-700 shadow-sm"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-800"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${
                  activeTab === item.value ? "text-emerald-600" : "text-stone-400"
                }`} />
                <span>{item.label}</span>
                {activeTab === item.value && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-600" />
                )}
              </button>
            )
          })}
        </nav>
        <div className="px-3 py-4 border-t border-stone-100">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-stone-50">
            <div className="h-7 w-7 rounded-full bg-stone-300 flex items-center justify-center text-xs font-semibold text-stone-600">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-stone-700 truncate">Admin</p>
              <p className="text-[10px] text-stone-500">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            id="admin-mobile-menu"
            role="dialog"
            aria-modal="true"
            ref={mobileMenuRef}
            className="relative mt-16 ml-3 sm:ml-4 w-[min(320px,calc(100%-32px))] rounded-2xl border border-stone-200 bg-white shadow-xl p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center text-white text-[10px] font-bold">
                  M
                </div>
                <p className="text-sm font-semibold text-stone-800">Menu</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} aria-label="Tutup menu">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = iconMap[item.value] || LayoutDashboard
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      onTabChange(item.value)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      activeTab === item.value
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${
                      activeTab === item.value ? "text-emerald-600" : "text-stone-400"
                    }`} />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-stone-200">
          <div className="flex items-center justify-between px-4 sm:px-6 h-14">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-stone-600 hover:text-stone-800"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Buka menu navigasi"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <p className="text-xs text-stone-500">
                  Admin / <span className="text-stone-700 font-medium">{labelMap[activeTab] || activeTab}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500 bg-stone-100 rounded-full px-3 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Online
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
