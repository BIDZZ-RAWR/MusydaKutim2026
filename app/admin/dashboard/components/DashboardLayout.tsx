"use client"

import { useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Menu, X, LayoutDashboard, Users, ClipboardList, Vote, Globe, LogOut,
} from "lucide-react"
import { apiPost } from "@/lib/api-client"
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
  const mainRef = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const prevOverflowRef = useRef("")

  const closeMenu = useCallback(() => setMobileMenuOpen(false), [setMobileMenuOpen])

  useEffect(() => {
    if (!mobileMenuOpen) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu()
    }
    document.addEventListener("keydown", handleKey)

    prevOverflowRef.current = document.body.style.overflow
    document.body.style.overflow = "hidden"
    document.documentElement.style.overscrollBehavior = "contain"

    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = prevOverflowRef.current
      document.documentElement.style.overscrollBehavior = ""
    }
  }, [mobileMenuOpen, closeMenu])

  const router = useRouter()
  const handleLogout = async () => {
    try {
      await apiPost("/api/auth/logout", {})
    } catch { /* ignore */ }
    router.push("/login")
  }

  const handleMenuSelect = (value: string) => {
    onTabChange(value)
    setMobileMenuOpen(false)
    requestAnimationFrame(() => {
      mainRef.current?.scrollTo({ top: 0, behavior: "instant" })
    })
  }

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
                onClick={() => handleMenuSelect(item.value)}
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
        <div className="px-3 py-4 border-t border-stone-100 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-stone-50">
            <div className="h-7 w-7 rounded-full bg-stone-300 flex items-center justify-center text-xs font-semibold text-stone-600">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-stone-700 truncate">Admin</p>
              <p className="text-[10px] text-stone-500">Super Admin</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-stone-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMenu}
          aria-hidden="true"
        />

        {/* Drawer Panel */}
        <div
          ref={drawerRef}
          id="admin-mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi admin"
          className={`fixed inset-y-0 left-0 w-[min(280px,80vw)] h-dvh bg-white border-r border-stone-200 shadow-xl flex flex-col transition-transform duration-300 ease-out ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-5 h-16 border-b border-stone-100 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                M
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-800 leading-tight">Musyran IPM</p>
                <p className="text-[10px] text-stone-500 tracking-wide uppercase">Dashboard Admin</p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeMenu}
              aria-label="Tutup menu"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Navigation */}
          <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = iconMap[item.value] || LayoutDashboard
              const isActive = activeTab === item.value
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleMenuSelect(item.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 min-h-[48px] rounded-xl text-sm font-medium transition-all duration-150 active:scale-[0.98] ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 shadow-sm"
                      : "text-stone-600 hover:bg-stone-50 hover:text-stone-800"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${
                    isActive ? "text-emerald-600" : "text-stone-400"
                  }`} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                  )}
                </button>
              )
            })}
          </nav>

          {/* Drawer Footer — Logout */}
          <div className="px-3 py-4 border-t border-stone-100 shrink-0 safe-area-inset-bottom">
            <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-stone-50">
              <div className="h-7 w-7 rounded-full bg-stone-300 flex items-center justify-center text-xs font-semibold text-stone-600">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-stone-700 truncate">Admin</p>
                <p className="text-[10px] text-stone-500">Super Admin</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { handleLogout(); closeMenu() }}
              className="w-full flex items-center gap-3 px-4 py-3 min-h-[48px] rounded-xl text-sm font-medium text-stone-500 hover:text-red-600 hover:bg-red-50 transition-all duration-150 active:scale-[0.98]"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div ref={mainRef} className="flex-1 lg:pl-64 overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-stone-200">
          <div className="flex items-center justify-between px-4 sm:px-6 h-14">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden min-h-[44px] min-w-[44px] text-stone-600 hover:text-stone-800"
                onClick={() => setMobileMenuOpen(true)}
                aria-expanded={mobileMenuOpen}
                aria-controls="admin-mobile-menu"
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
        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
