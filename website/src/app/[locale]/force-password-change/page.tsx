"use client"

import { useEffect, useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { AlertCircle } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { usePasswordRules } from "@/hooks/usePasswordRules"
import { fetchJson } from "@/lib/http"

import { ForcePasswordChangeForm } from "./_components/force-password-change-form"

export default function ForcePasswordChangePage() {
  const router = useRouter()

  const [username, setUsername] = useState<string | null>(null)
  const [error, setError] = useState("")

  const { data: rules, isLoading: rulesLoading } = usePasswordRules()

  useEffect(() => {
    const checkToken = async () => {
      try {
        const data = await fetchJson<{ success: boolean; username: string }>("/api/auth/validate-password-token", {
          method: "POST",
          credentials: "include",
        })

        setUsername(data.username)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Votre lien de changement de mot de passe a expiré. Veuillez vous reconnecter.",
        )
        setTimeout(() => router.push("/login"), 3000)
      }
    }

    checkToken()
  }, [router])

  if (!username) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Chargement</CardTitle>
            <CardDescription>{rulesLoading ? "Chargement des règles..." : "Validation du lien..."}</CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <Button onClick={() => router.push("/login")} className="w-full">
                Retour à la connexion
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Changement de mot de passe obligatoire</CardTitle>
          <CardDescription>
            Votre mot de passe a expiré ou est temporaire. Vous devez le changer pour continuer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForcePasswordChangeForm username={username} rules={rules} />
        </CardContent>
      </Card>
    </div>
  )
}
