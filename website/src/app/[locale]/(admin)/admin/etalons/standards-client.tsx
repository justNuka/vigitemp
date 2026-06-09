"use client"

import { LazyMotion, domAnimation, m } from "motion/react"
import { fadeInUp } from "@/lib/motion-variants"
import { useEffect, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import type { Standard } from "@/hooks/useStandards"
import { useStandards } from "@/hooks/useStandards"
import { deleteJson, getJson } from "@/lib/http"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { TanStackTable } from "@/components/data-table/tanstack-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useRouter } from '@/i18n/navigation'
import { StandardModal } from "./standard-modal"
import { Archive, Pencil, Plus, TestTube2 } from "lucide-react"
import { useTranslations } from "next-intl"

type StandardRow = {
  Id_Etalon: number
  Etalon_Numero_Serie: string | null
  Etat_Etalon: string | null
}

export function StandardsClient() {
  const { data: standards, isLoading } = useStandards()
  const queryClient = useQueryClient()
  const router = useRouter()
  const t = useTranslations('standardsPage')
  const didPrefetchRef = useRef(false)
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)

  useEffect(() => {
    if (isLoading || didPrefetchRef.current) return
    didPrefetchRef.current = true

    queryClient.prefetchQuery({
      queryKey: ["etalon-types"],
      queryFn: () => getJson("/api/etalons/types"),
    })
    queryClient.prefetchQuery({
      queryKey: ["modules"],
      queryFn: () => getJson("/api/modules"),
      staleTime: 60000,
    })
  }, [isLoading, queryClient])

  const handleAddClick = () => {
    setSelectedStandard(null)
    setIsEditing(false)
    setIsModalOpen(true)
  }

  const handleEditClick = () => {
    if (selectedStandard) {
      setIsEditing(true)
      setIsModalOpen(true)
    }
  }

  const handleArchiveClick = () => {
    setIsArchiveDialogOpen(true)
  }

  const handleConfirmArchive = async () => {
    if (!selectedStandard) return

    try {
      await deleteJson(`/api/etalons/${selectedStandard.Id_Etalon}`)
      toast.success(t('toast.archive_success'))
      setIsArchiveDialogOpen(false)
      setSelectedStandard(null)
      await queryClient.invalidateQueries({ queryKey: ["etalons"] })
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toast.archive_error'))
    }
  }

  const handleTestClick = () => {
  }

  const columns: ColumnDef<StandardRow>[] = [
    {
      accessorKey: "Etalon_Numero_Serie",
      header: t('table.columns.serial'),
    },
    {
      id: "pdf_name",
      header: t('table.columns.pdf'),
      cell: ({ row }) => standards?.find((item) => item.Id_Etalon === row.original.Id_Etalon)?.Pdf_Name || "-",
    },
    {
      accessorKey: "Etat_Etalon",
      header: t('table.columns.state'),
      cell: ({ row }) => (
        <Badge variant={row.getValue("Etat_Etalon") === "1" ? "default" : "outline"}>
          {row.getValue("Etat_Etalon") === "1" ? t('state.active') : t('state.inactive')}
        </Badge>
      ),
    },
  ]

  const tableData: StandardRow[] = (standards || []).map((e) => ({
    Id_Etalon: e.Id_Etalon,
    Etalon_Numero_Serie: e.Etalon_Numero_Serie,
    Etat_Etalon: e.Etat_Etalon,
  }))

  return (
    <LazyMotion features={domAnimation}>
      <m.main
        className="flex-1 p-4 md:p-6 space-y-6"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>{t('title')}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {t('count', { count: standards?.length || 0 })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddClick} variant="default" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                {t('actions.add')}
              </Button>
              <Button onClick={handleEditClick} disabled={!selectedStandard} variant="outline" size="sm" className="gap-2">
                <Pencil className="h-4 w-4" />
                {t('actions.edit')}
              </Button>
              <Button onClick={handleArchiveClick} disabled={!selectedStandard} variant="outline" size="sm" className="gap-2">
                <Archive className="h-4 w-4" />
                {t('actions.archive')}
              </Button>
              <Button onClick={handleTestClick} disabled={!selectedStandard} variant="outline" size="sm" className="gap-2">
                <TestTube2 className="h-4 w-4" />
                {t('actions.test')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-2 md:p-4 xl:p-4">
            <TanStackTable
              columns={columns}
              data={tableData}
              searchField="Etalon_Numero_Serie"
              searchPlaceholder={t('table.search_placeholder')}
              isLoading={isLoading}
              emptyMessage={t('table.empty')}
              selectedRowId={selectedStandard?.Id_Etalon}
              onRowClick={(row: StandardRow) => {
                setSelectedStandard(standards?.find((e) => e.Id_Etalon === row.Id_Etalon) || null)
              }}
              onRowDoubleClick={(row: StandardRow) => {
                const standard = standards?.find((e) => e.Id_Etalon === row.Id_Etalon) || null
                if (!standard) return
                setSelectedStandard(standard)
                setIsEditing(true)
                setIsModalOpen(true)
              }}
              maxHeight="60vh"
              headerClassName="!bg-sidebar !text-sidebar-foreground"
              headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
              tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
            />
          </CardContent>
        </Card>

        <StandardModal open={isModalOpen} onOpenChange={setIsModalOpen} standard={selectedStandard} isEditing={isEditing} />

        <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('archive.title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('archive.description')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogCancel>{t('archive.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmArchive}>{t('archive.confirm')}</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      </m.main>
    </LazyMotion>
  )
}

