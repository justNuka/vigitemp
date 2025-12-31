"use client"

import { useEffect, useMemo, useState } from "react"

import { buildAuditCommentColumns } from "./_components/build-audit-comment-columns"
import { CommentsFormCard } from "./_components/comments-form-card"
import { CommentsTableCard } from "./_components/comments-table-card"
import { EditCommentDialog } from "./_components/edit-comment-dialog"
import type { AuditCode, AuditComment } from "./_components/audit-comments-types"
import { getJson, patchJson, postJson } from "@/lib/http"

export function CommentsTab() {
  const [auditCodes, setAuditCodes] = useState<AuditCode[]>([])
  const [comments, setComments] = useState<AuditComment[]>([])
  const [selectedType, setSelectedType] = useState<string>("")
  const [commentText, setCommentText] = useState("")
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingComment, setEditingComment] = useState<AuditComment | null>(null)
  const [editText, setEditText] = useState("")
  const [isLoading, setIsLoading] = useState(true)

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
    () => buildAuditCommentColumns({ auditCodes }),
    [auditCodes],
  )

  const handleSave = async () => {
    if (!selectedType || !commentText.trim()) return

    try {
      await postJson("/api/audit/comments", { type: selectedType, text: commentText })

      setComments((prev) => {
        const existing = prev.find((comment) => comment.type === selectedType)
        if (existing) {
          return prev.map((comment) =>
            comment.type === selectedType ? { ...comment, text: commentText } : comment,
          )
        }
        const nextId = Math.max(0, ...prev.map((item) => item.id)) + 1
        return [...prev, { id: nextId, type: selectedType, text: commentText }]
      })
      setCommentText("")
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

  const handleEditComment = async () => {
    if (!editingComment || !editText.trim()) return

    try {
      await patchJson("/api/audit/comments", { type: editingComment.type, text: editText })

      setComments(
        comments.map((comment) =>
          comment.type === editingComment.type ? { ...comment, text: editText } : comment,
        ),
      )
      setIsEditDialogOpen(false)
      setEditingComment(null)
      setEditText("")
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
    setEditText(comment.text)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <CommentsFormCard
        auditCodes={auditCodes}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        commentText={commentText}
        onCommentTextChange={setCommentText}
        isLoading={isLoading}
        onSave={handleSave}
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
        editText={editText}
        onEditTextChange={setEditText}
        onSave={handleEditComment}
      />
    </div>
  )
}
