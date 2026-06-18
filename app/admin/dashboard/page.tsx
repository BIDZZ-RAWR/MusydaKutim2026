"use client"

import { Toaster } from "sonner"
import { NAV_ITEMS } from "./constants"
import { useAdminDashboard } from "./hooks/useAdminDashboard"
import { DashboardLayout } from "./components/DashboardLayout"
import { OverviewTab } from "./components/OverviewTab"
import { PanitiaTab } from "./components/PanitiaTab"
import { PesertaTab } from "./components/PesertaTab"
import { CalonTab } from "./components/CalonTab"
import { LandingTab } from "./components/LandingTab"

export default function AdminDashboardPage() {
  const {
    panitiaList,
    pesertaList,
    candidateList,
    bilikList,
    pesertaLoading,
    pesertaHasMore,
    pesertaTotalCount,
    landingContent,
    landingStatus,
    rolesMap,
    roleLabels,
    viewStats,
    editHistory,
    savingLanding,
    activeTab, setActiveTab,
    mobileMenuOpen, setMobileMenuOpen,
    showFullHistory, setShowFullHistory,
    resetPeserta,
    loadMorePeserta,
    handleSaveAllLanding,
    handleRefreshAll,
    setLandingContent,
    setLandingStatus,
    setRolesMap,
    setRoleLabels,
    fetchCandidates,
  } = useAdminDashboard()

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <DashboardLayout
        navItems={NAV_ITEMS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      >
        {activeTab === "overview" && (
          <OverviewTab
            panitiaCount={panitiaList.length}
            pesertaTotalCount={pesertaTotalCount || pesertaList.length}
            candidateCount={candidateList.length}
            candidateList={candidateList}
            viewStats={viewStats}
            editHistory={editHistory}
            showFullHistory={showFullHistory}
            setShowFullHistory={setShowFullHistory}
          />
        )}

        {activeTab === "panitia" && (
          <PanitiaTab
            panitiaList={panitiaList}
            bilikList={bilikList}
            viewStats={viewStats}
            editHistory={editHistory}
            showFullHistory={showFullHistory}
            setShowFullHistory={setShowFullHistory}
            onRefresh={handleRefreshAll}
          />
        )}

        {activeTab === "peserta" && (
          <PesertaTab
            pesertaList={pesertaList}
            pesertaTotalCount={pesertaTotalCount || pesertaList.length}
            pesertaLoading={pesertaLoading}
            pesertaHasMore={pesertaHasMore}
            onRefresh={handleRefreshAll}
            onLoadMore={loadMorePeserta}
            onReset={resetPeserta}
          />
        )}

        {activeTab === "calon" && (
          <CalonTab
            candidateList={candidateList}
            onRefresh={fetchCandidates}
          />
        )}

        {activeTab === "landing" && (
          <LandingTab
            landingContent={landingContent}
            landingStatus={landingStatus}
            rolesMap={rolesMap}
            roleLabels={roleLabels}
            candidateList={candidateList}
            savingLanding={savingLanding}
            onContentChange={(key, value) => setLandingContent((prev) => ({ ...prev, [key]: value }))}
            onStatusChange={(key, value) => setLandingStatus((prev) => ({ ...prev, [key]: value }))}
            onRoleChange={(roleKey, candidateId) => setRolesMap((prev) => ({ ...prev, [roleKey]: candidateId }))}
            onLabelChange={(roleKey, label) => setRoleLabels((prev) => ({ ...prev, [roleKey]: label }))}
            onSaveAll={handleSaveAllLanding}
          />
        )}
      </DashboardLayout>
    </>
  )
}
