"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { postJson, HttpError } from "@/lib/http"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type HotlineLoginFormProps = {
  slug: string
  username?: string
}

export function HotlineLoginForm({ slug, username }: HotlineLoginFormProps) {
  const router = useRouter()
  const params = useParams()
  const locale = typeof params?.locale === "string" ? params.locale : "fr"
  const [login, setLogin] = useState(username || "")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await postJson("/api/hotline/login", {
        slug,
        username: login,
        password,
      })
      router.replace(`/${locale}/hotline/${slug}`)
    } catch (err) {
      const message =
        err instanceof HttpError
          ? err.payload?.message || "Connexion refusee"
          : "Connexion refusee"
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Portail hotline</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="hotline-user">Identifiant</Label>
            <Input
              id="hotline-user"
              value={login}
              onChange={(event) => setLogin(event.target.value)}
              autoComplete="username"
              placeholder="hotline"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hotline-password">Mot de passe</Label>
            <Input
              id="hotline-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
