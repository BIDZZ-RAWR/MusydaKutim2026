"use client"

import Image from "next/image"

interface MobileRoleListProps {
  groups: {
    title: string
    keys: string[]
    meta: string
  }[]
  roleList: { key: string; label: string }[]
  rolesMap: Record<string, string>
  candidates: { id: string; NamaCalonFormatur: string; FotoCalonFormatur?: string }[]
  landingContent: {
    structureBackboneColor?: string
    structureGroupTitleColor?: string
    structureGroupTitleSize?: string
    structureGroupIntiTitle?: string
    structureGroupBidangTitle?: string
  }
  onSheetOpen: (data: { role: string; name: string; meta: string; photo?: string }) => void
}

export default function MobileRoleList({ groups, roleList, rolesMap, candidates, landingContent, onSheetOpen }: MobileRoleListProps) {
  const candidateById = (id: string) => candidates.find((c) => c.id === id)

  return (
    <div className="md:hidden relative mx-auto max-w-[560px] overflow-hidden">
      <div
        className="absolute left-1/2 top-6 bottom-6 w-px"
        style={{ backgroundColor: landingContent.structureBackboneColor || "#e5e7eb" }}
        aria-hidden
      />
      <div className="relative space-y-4 px-2">
        {groups.map((group) => (
          <div key={group.title} className="space-y-3">
            <div
              className="tracking-wide uppercase"
              style={{
                color: landingContent.structureGroupTitleColor || "#0f172a",
                fontWeight: 800,
                fontSize: `${Number(landingContent.structureGroupTitleSize) || 0.95}rem`,
              }}
            >
              {group.title}
            </div>
            <div className="flex flex-col" style={{ gap: "10px" }}>
              {group.keys.map((key) => {
                const role = roleList.find((r) => r.key === key)
                if (!role) return null
                const selectedId = rolesMap[key]
                const candidate = selectedId ? candidateById(selectedId) : null
                const person = {
                  role: role.label,
                  name: candidate ? candidate.NamaCalonFormatur : "Belum diatur",
                  meta: group.meta,
                  photo: candidate?.FotoCalonFormatur,
                }
                return (
                  <button
                    key={key}
                    className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 shadow-sm text-left transition active:scale-[0.99]"
                    style={{ minHeight: "clamp(78px,18vw,86px)", borderLeft: "4px solid #16a34a" }}
                    onClick={() => onSheetOpen(person)}
                  >
                    <div
                      className="flex items-center justify-center rounded-lg bg-gray-100 overflow-hidden shrink-0"
                      style={{
                        width: "clamp(46px,12vw,54px)",
                        height: "clamp(62px,16vw,72px)",
                        aspectRatio: "3 / 4",
                      }}
                    >
                      {person.photo ? (
                        <Image
                          src={person.photo}
                          alt={person.name}
                          width={80}
                          height={106}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-[11px] font-semibold text-gray-500 leading-tight text-center">
                          Foto<br />3x4
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[clamp(14.5px,3.8vw,16px)] font-black text-gray-900 leading-tight truncate">
                        {person.role}
                      </div>
                      <div className="text-[clamp(13px,3.4vw,14px)] font-semibold text-gray-800 truncate">
                        {person.name}
                      </div>
                      <div className="text-[clamp(11px,3vw,12px)] font-semibold text-gray-500">{person.meta}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
