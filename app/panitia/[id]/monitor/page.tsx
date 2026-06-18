"use client"

import { useMonitor } from "@/components/monitor/hooks/useMonitor"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import IdleState from "@/components/monitor/IdleState"
import VoterHeader from "@/components/monitor/VoterHeader"
import CandidateCard from "@/components/monitor/CandidateCard"
import VoteActionBar from "@/components/monitor/VoteActionBar"

export default function MonitorPage() {
  const { toast } = useToast()

  const onToast = (variant: string, title: string, description: string) => {
    if (variant === "success") {
      toast({ title, description, className: "bg-green-500 text-white border-none" })
    } else {
      toast({ variant: "destructive", title, description })
    }
  }

  const {
    bilikId,
    bilikState,
    candidates,
    selectedCandidates,
    isSubmitting,
    toggleCandidate,
    handleVote,
  } = useMonitor(onToast)

  if (bilikState.status === "idle") {
    return <IdleState bilikId={bilikId} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 sm:p-6 animate-in zoom-in-95 duration-500">
      <Toaster />
      <div className="max-w-6xl mx-auto">
        <VoterHeader
          voterName={bilikState.activeVoterName || ""}
          selectedCount={selectedCandidates.length}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {candidates.map((candidate, idx) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              isSelected={selectedCandidates.includes(candidate.id)}
              orderNumber={selectedCandidates.indexOf(candidate.id) + 1}
              onToggle={() => toggleCandidate(candidate.id)}
              index={idx}
            />
          ))}
        </div>

        <VoteActionBar
          disabled={isSubmitting || selectedCandidates.length !== 9}
          isSubmitting={isSubmitting}
          onSubmit={handleVote}
        />

        <div className="h-20 sm:h-24"></div>
      </div>
    </div>
  )
}
