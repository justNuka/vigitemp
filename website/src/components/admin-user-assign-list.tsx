"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

export type AdminAssignableUser = {
  id: number
  username: string
  displayName: string
}

export function AdminUserAssignList({
  idPrefix,
  users,
  selectedIds,
  onChange,
  title,
  emptyLabel,
  checkAllLabel,
  uncheckAllLabel,
  searchPlaceholder,
  loading = false,
}: {
  idPrefix: string
  users: AdminAssignableUser[]
  selectedIds: number[]
  onChange: (ids: number[]) => void
  title: string
  emptyLabel: string
  checkAllLabel: string
  uncheckAllLabel: string
  searchPlaceholder: string
  loading?: boolean
}) {
  const [query, setQuery] = useState("")
  const selected = useMemo(() => new Set(selectedIds), [selectedIds])
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return users
    return users.filter((user) =>
      [user.displayName, user.username].join(" ").toLowerCase().includes(needle),
    )
  }, [query, users])

  const toggle = (id: number, checked: boolean) => {
    if (checked) {
      onChange(Array.from(new Set([...selectedIds, id])))
      return
    }
    onChange(selectedIds.filter((current) => current !== id))
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] font-semibold text-foreground">
          {title}
          <span className="num ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-[hsl(var(--surface-sunken))] px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {selectedIds.length}
          </span>
        </p>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[11px]"
            onClick={() => onChange(users.map((user) => user.id))}
            disabled={loading || users.length === 0}
          >
            {checkAllLabel}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[11px]"
            onClick={() => onChange([])}
            disabled={loading || selectedIds.length === 0}
          >
            {uncheckAllLabel}
          </Button>
        </div>
      </div>

      <div className="group/search relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within/search:text-primary" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="h-8 border-border bg-[hsl(var(--primary-soft)/0.45)] pl-8 text-[12px] shadow-sm transition-[border-color,box-shadow,background-color] duration-200 focus-visible:border-primary/55 focus-visible:ring-2 focus-visible:ring-primary/15 focus-visible:ring-offset-0"
        />
      </div>

      <div className="scroll-thin max-h-72 overflow-y-auto rounded-md border border-border">
        {loading ? (
          <p className="px-3 py-6 text-center text-[13px] text-muted-foreground">…</p>
        ) : filtered.length === 0 ? (
          <p className="px-3 py-6 text-center text-[13px] text-muted-foreground">{emptyLabel}</p>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((user) => {
              const checked = selected.has(user.id)
              return (
                <li
                  key={user.id}
                  className="transition-colors duration-150 hover:bg-[hsl(var(--surface-muted)/0.70)]"
                >
                  <label
                    htmlFor={`${idPrefix}-user-${user.id}`}
                    className="flex cursor-pointer items-start gap-3 px-3 py-2"
                  >
                    <Checkbox
                      id={`${idPrefix}-user-${user.id}`}
                      checked={checked}
                      onCheckedChange={(next) => toggle(user.id, next === true)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-foreground">
                        {user.displayName || user.username}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">{user.username}</span>
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
