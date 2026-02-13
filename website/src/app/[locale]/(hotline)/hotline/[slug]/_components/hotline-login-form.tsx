"use client"
import { showFormValidationToast } from "@/lib/form-toast"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { postJson, HttpError } from "@/lib/http"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"

type HotlineLoginFormProps = {
  slug: string
  username?: string
}

export function HotlineLoginForm({ slug, username }: HotlineLoginFormProps) {
  const router = useRouter()
  const params = useParams()
  const locale = typeof params?.locale === "string" ? params.locale : "fr"
  const t = useTranslations("hotlineLogin")
  const [error, setError] = useState<string | null>(null)

  const hotlineLoginSchema = z.object({
    username: z.string().min(1, t("validation.username_required")),
    password: z.string().min(1, t("validation.password_required")),
  })

  type HotlineLoginFormValues = z.infer<typeof hotlineLoginSchema>

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<HotlineLoginFormValues>({
    resolver: zodResolver(hotlineLoginSchema),
    defaultValues: {
      username: username || "",
      password: "",
    },
  })

  const onSubmit = async (values: HotlineLoginFormValues) => {
    setError(null)
    try {
      await postJson("/api/hotline/login", {
        slug,
        username: values.username,
        password: values.password,
      })
      router.replace(`/${locale}/hotline/${slug}`)
    } catch (err) {
      const message =
        err instanceof HttpError
          ? err.payload?.message || t("errors.login_failed")
          : t("errors.login_failed")
      setError(message)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit, (errors) => showFormValidationToast(errors))}>
          <div className="space-y-2">
            <Label htmlFor="hotline-user">{t("fields.username_label")}</Label>
            <Input
              id="hotline-user"
              {...register("username")}
              autoComplete="username"
              placeholder={t("fields.username_placeholder")}
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? "hotline-user-error" : undefined}
            />
            {errors.username?.message && (
              <p id="hotline-user-error" className="text-sm text-destructive">
                {String(errors.username.message)}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="hotline-password">{t("fields.password_label")}</Label>
            <Input
              id="hotline-password"
              type="password"
              {...register("password")}
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "hotline-password-error" : undefined}
            />
            {errors.password?.message && (
              <p id="hotline-password-error" className="text-sm text-destructive">
                {String(errors.password.message)}
              </p>
            )}
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("actions.submit_loading") : t("actions.submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
