"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Monitor } from "lucide-react"

interface MonitorStatusProps {
  panitiaId: string
  monitorConnected: boolean
  lastHeartbeat: Date | null
}

export default function MonitorStatus({ panitiaId, monitorConnected, lastHeartbeat }: MonitorStatusProps) {
  return (
    <Card
      className={`transition-all duration-300 ${monitorConnected ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}`}
    >
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Monitor className="w-4 h-4" />
          Status Monitor Pada Bilik {panitiaId}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${monitorConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
            />
            <span className={`text-sm font-medium ${monitorConnected ? "text-green-700" : "text-red-700"}`}>
              {monitorConnected ? "Monitor Terhubung & Aktif" : "Monitor Tidak Terhubung"}
            </span>
          </div>
          {lastHeartbeat && (
            <span className="text-xs text-gray-500">{new Date(lastHeartbeat).toLocaleTimeString("id-ID")}</span>
          )}
        </div>
        {!monitorConnected && (
          <p className="text-xs text-red-600 mt-2">Pastikan Website Di Monitor Sudah Di Buka Di Perangkat Lain</p>
        )}
      </CardContent>
    </Card>
  )
}
