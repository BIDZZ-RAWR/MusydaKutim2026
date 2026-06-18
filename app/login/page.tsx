"use client"

import { useLogin } from "@/components/login/hooks/useLogin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ModeSelectionDialog from "@/components/login/ModeSelectionDialog"

export default function LoginPage() {
  const {
    email, setEmail,
    password, setPassword,
    loading,
    error,
    showModeSelection, setShowModeSelection,
    handleLogin,
    handleModeSelect,
  } = useLogin()

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-green-700">Login Petugas</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="panitia01@ipm.or.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <ModeSelectionDialog
        open={showModeSelection}
        onOpenChange={setShowModeSelection}
        onSelectMode={handleModeSelect}
      />
    </div>
  )
}
