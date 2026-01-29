"use client"

import { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { buildAuditCommentColumns } from "./_components/build-audit-comment-columns"
import { CommentsFormCard } from "./_components/comments-form-card"
import { CommentsTableCard } from "./_components/comments-table-card"
import { EditCommentDialog } from "./_components/edit-comment-dialog"
import type { AuditCode, AuditComment } from "./_components/audit-comments-types"
import { getJson, patchJson, postJson } from "@/lib/http"
import { useTranslations } from 'next-intl'

export function CommentsTab() {
  const t = useTranslations('toolsComments')
  const [auditCodes, setAuditCodes] = useState<AuditCode[]>([])
  const [comments, setComments] = useState<AuditComment[]>([])
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingComment, setEditingComment] = useState<AuditComment | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const commentsSchema = z.object({
    type: z.string().min(1, t('validation.type_required')),
    text: z.string().min(1, t('validation.comment_required')).max(255, t('validation.max', { max: 255 })),
  })

  type CommentsFormValues = z.infer<typeof commentsSchema>

  const {
    handleSubmit,
    control,
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CommentsFormValues>({
    resolver: zodResolver(commentsSchema),
    defaultValues: {
      type: "",
      text: "",
    },
  })

  const selectedType = watch("type")
  const commentText = watch("text")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const codesData = await getJson<AuditCode[]>("/api/audit/codes")
        setAuditCodes(codesData)

        const commentsData = await getJson<AuditComment[]>("/api/audit/comments")
        setComments(commentsData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredComments = useMemo(() => {
    if (!selectedType) return comments
    return comments.filter((comment) => comment.type === selectedType)
  }, [comments, selectedType])

  const columns = useMemo(
    () => buildAuditCommentColumns({
      auditCodes,
      labels: {
        type: t('table.columns.type'),
        comment: t('table.columns.comment'),
      },
    }),
    [auditCodes, t],
  )

  const handleSave = async (values: CommentsFormValues) => {
    try {
      await postJson("/api/audit/comments", { type: values.type, text: values.text })

      setComments((prev) => {
        const existing = prev.find((comment) => comment.type === values.type)
        if (existing) {
          return prev.map((comment) =>
            comment.type === values.type ? { ...comment, text: values.text } : comment,
          )
        }
        const nextId = Math.max(0, ...prev.map((item) => item.id)) + 1
        return [...prev, { id: nextId, type: values.type, text: values.text }]
      })
      setValue("text", "")
    } catch (error) {
      console.error("Error saving comment:", error)
    }
  }

  const handleDeleteComment = async (id: number) => {
    const commentToDelete = comments.find((comment) => comment.id === id)
    if (!commentToDelete) return

    try {
      await patchJson("/api/audit/comments", { type: commentToDelete.type, text: "" })

      setComments(comments.filter((comment) => comment.id !== id))
      setSelectedCommentId(null)
    } catch (error) {
      console.error("Error deleting comment:", error)
    }
  }

  const handleEditComment = async (text: string) => {
    if (!editingComment || !text.trim()) return

    try {
      await patchJson("/api/audit/comments", { type: editingComment.type, text })

      setComments(
        comments.map((comment) =>
          comment.type === editingComment.type ? { ...comment, text } : comment,
        ),
      )
      setIsEditDialogOpen(false)
      setEditingComment(null)
      setSelectedCommentId(null)
    } catch (error) {
      console.error("Error updating comment:", error)
    }
  }

  const handleOpenEdit = () => {
    if (selectedCommentId === null) return
    const comment = comments.find((c) => c.id === selectedCommentId)
    if (!comment) return

    setEditingComment(comment)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <CommentsFormCard
        auditCodes={auditCodes}
        isLoading={isLoading}
        onSubmit={handleSubmit(handleSave)}
        control={control}
        register={register}
        errors={errors}
        isSubmitting={isSubmitting}
        commentLength={commentText?.length ?? 0}
      />

      <CommentsTableCard
        comments={filteredComments}
        columns={columns}
        selectedCommentId={selectedCommentId}
        onSelectCommentId={setSelectedCommentId}
        onOpenEdit={handleOpenEdit}
        onDeleteSelected={() => {
          if (selectedCommentId !== null) {
            handleDeleteComment(selectedCommentId)
          }
        }}
      />

      <EditCommentDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        commentType={editingComment?.type}
        initialText={editingComment?.text || ""}
        onSave={(text) => {
          void handleEditComment(text)
        }}
      />
    </div>
  )
}
