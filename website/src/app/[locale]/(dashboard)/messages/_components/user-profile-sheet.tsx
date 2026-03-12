"use client"

import { useTranslations } from "next-intl"
import { Mail, Phone, PhoneCall, User, Shield, Calendar } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "../_utils"
import type { ConversationParticipant } from "./_types"

type UserProfileSheetProps = {
  user: ConversationParticipant | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString([], { day: "numeric", month: "long", year: "numeric" })
}

export function UserProfileSheet({ user, open, onOpenChange }: UserProfileSheetProps) {
  const t = useTranslations("messaging.details")

  if (!user) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 sm:w-96 overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle>{t("user_profile_title")}</SheetTitle>
        </SheetHeader>

        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-3 py-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatar ?? undefined} />
            <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
              {getInitials(user.displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="text-base font-semibold">{user.displayName}</p>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-3 px-1">
          {user.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <a
                href={`mailto:${user.email}`}
                className="text-sm hover:underline break-all"
              >
                {user.email}
              </a>
            </div>
          )}

          {user.role && (
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm">{user.role}</span>
            </div>
          )}

          {user.phoneMobile && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm">{user.phoneMobile}</span>
            </div>
          )}

          {user.phoneFixed && (
            <div className="flex items-center gap-3">
              <PhoneCall className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm">{user.phoneFixed}</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">
              {t("member_since")} {formatDate(user.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">
              {t("joined_conversation")} {formatDate(user.joinedAt)}
            </span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
