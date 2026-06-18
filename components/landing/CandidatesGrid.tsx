import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

interface CandidatesGridProps {
  candidates: { id: string; NamaCalonFormatur: string; FotoCalonFormatur?: string }[]
  landingContent: any
  sizeByDevice: (desktopKey: string, mobileKey: string) => number
}

export default function CandidatesGrid({ candidates, landingContent, sizeByDevice }: CandidatesGridProps) {
  return (
    <section>
      <h2
        className="font-bold text-center mb-2"
        style={{
          color: landingContent.candidateSectionTitleColor,
          fontSize: `${sizeByDevice("candidateSectionTitleSize", "candidateSectionTitleSizeMobile") || 0}rem`,
        }}
      >
        {landingContent.candidateSectionTitle}
      </h2>
      <p
        className="text-center mb-6"
        style={{
          color: landingContent.candidateSubtitleColor,
          fontSize: `${sizeByDevice("candidateSubtitleSize", "candidateSubtitleSizeMobile") || 0}rem`,
        }}
      >
        {landingContent.candidateSubtitle}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((candidate) => (
          <Card
            key={candidate.id}
            className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="aspect-[3/4] relative bg-gray-100 overflow-hidden">
              {candidate.FotoCalonFormatur ? (
                <Image
                  src={candidate.FotoCalonFormatur || "/placeholder.svg"}
                  alt={candidate.NamaCalonFormatur}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
              )}
              <div
                className={`absolute top-0 left-0 px-4 py-2 font-bold z-10 ${landingContent.candidateBadgeShadow === false ? "" : "shadow-lg"}`}
                style={{
                  backgroundColor: landingContent.candidateBadgeBgColor || "#16a34a",
                  color: landingContent.candidateBadgeTextColor || "#ffffff",
                  fontSize: `${Number(landingContent.candidateBadgeFontSize) || 0}rem`,
                  borderRadius:
                    landingContent.candidateBadgeShape === "square"
                      ? "0"
                      : "0 0 0.75rem 0",
                  textTransform: landingContent.candidateBadgeTextTransform || "none",
                }}
              >
                {(landingContent.candidateBadgePrefix || "Calon") + " " + candidate.id}
              </div>
            </div>
            <CardContent className="p-4 text-center bg-white relative z-20">
              <h3 className="font-bold text-lg text-gray-900">{candidate.NamaCalonFormatur}</h3>
              <p
                className="text-sm"
                style={{
                  color: landingContent.candidateSubtitleColor,
                  fontSize: `${Number(landingContent.candidateSubtitleSize) || 0}rem`,
                }}
              >
                {landingContent.candidateSubtitle}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
