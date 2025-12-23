"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TanStackTable } from "@/components/data-table/tanstack-table";
import { ColumnDef } from "@tanstack/react-table";
import { Trash2, Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface JournalCode {
  Code_Journal: string;
  Commentaire: string | null;
}

interface Comment {
  id: number;
  type: string;
  text: string;
}

export function CommentsTab() {
  const [journalCodes, setJournalCodes] = useState<JournalCode[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [commentText, setCommentText] = useState("");
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editText, setEditText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Récupérer les codes de journal et les commentaires depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les codes de journal
        const codesResponse = await fetch("/api/journal/codes");
        if (codesResponse.ok) {
          const codesData = await codesResponse.json();
          setJournalCodes(codesData);
        }

        // Récupérer les commentaires
        const commentsResponse = await fetch("/api/journal/comments");
        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json();
          setComments(commentsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrer les commentaires selon le type sélectionné
  const filteredComments = useMemo(() => {
    if (!selectedType) return comments;
    return comments.filter((c) => c.type === selectedType);
  }, [comments, selectedType]);

  const handleSave = async () => {
    if (!selectedType || !commentText.trim()) return;

    try {
      const response = await fetch("/api/journal/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          text: commentText,
        }),
      });

      if (response.ok) {
        const savedComment = await response.json();
        // Mettre à jour ou ajouter le commentaire dans la liste
        setComments(prev => {
          const existing = prev.find(c => c.type === selectedType);
          if (existing) {
            return prev.map(c => c.type === selectedType ? { ...c, text: commentText } : c);
          }
          return [...prev, { id: prev.length + 1, type: selectedType, text: commentText }];
        });
        setCommentText("");
      }
    } catch (error) {
      console.error("Error saving comment:", error);
    }
  };

  const handleDeleteComment = async (id: number) => {
    const commentToDelete = comments.find(c => c.id === id);
    if (!commentToDelete) return;

    try {
      // Vider le commentaire au lieu de le supprimer
      const response = await fetch("/api/journal/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: commentToDelete.type,
          text: "",
        }),
      });

      if (response.ok) {
        setComments(comments.filter((c) => c.id !== id));
        setSelectedCommentId(null);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleEditComment = async () => {
    if (!editingComment || !editText.trim()) return;

    try {
      const response = await fetch("/api/journal/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: editingComment.type,
          text: editText,
        }),
      });

      if (response.ok) {
        setComments(
          comments.map((c) => (c.type === editingComment.type ? { ...c, text: editText } : c))
        );
        setIsEditDialogOpen(false);
        setEditingComment(null);
        setEditText("");
        setSelectedCommentId(null);
      }
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleOpenEdit = () => {
    const comment = filteredComments.find((c) => c.id === selectedCommentId);
    if (comment) {
      setEditingComment(comment);
      setEditText(comment.text);
      setIsEditDialogOpen(true);
    }
  };

  const columns: ColumnDef<Comment>[] = [
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const code = journalCodes.find((j) => j.Code_Journal === row.original.type);
        return (
          <div>
            <p className="font-medium">{row.original.type}</p>
            <p className="text-xs text-muted-foreground">{code?.Commentaire}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "text",
      header: "Commentaire",
      cell: ({ row }) => <div>{row.original.text}</div>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Form Card */}
      <Card className="border-black dark:border-black">
        <CardHeader>
          <CardTitle>Ajouter un commentaire</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="type-select" className="text-sm font-medium">
              Type de journal
            </label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger id="type-select" disabled={isLoading}>
                <SelectValue placeholder="Sélectionner un type..." />
              </SelectTrigger>
              <SelectContent>
                {journalCodes.map((code) => (
                  <SelectItem key={code.Code_Journal} value={code.Code_Journal}>
                    {code.Code_Journal} {code.Commentaire ? `- ${code.Commentaire}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="comment-textarea" className="text-sm font-medium">
              Commentaire
            </label>
            <Textarea
              id="comment-textarea"
              placeholder="Entrer le commentaire..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              maxLength={255}
              rows={4}
            />
            <p className="text-xs text-muted-foreground text-right">
              {commentText.length}/255 caractères
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={!selectedType || !commentText.trim()}
            className="w-full sm:w-auto"
          >
            Enregistrer
          </Button>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card className="border-black dark:border-black">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Commentaires</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredComments.length} commentaire{filteredComments.length > 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleOpenEdit}
              disabled={selectedCommentId === null}
              variant="outline"
              size="sm"
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Modifier
            </Button>
            <Button
              onClick={() => {
                if (selectedCommentId) {
                  handleDeleteComment(selectedCommentId);
                }
              }}
              disabled={selectedCommentId === null}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Supprimer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <TanStackTable
            columns={columns}
            data={filteredComments}
            pageSize={20}
            emptyMessage="Aucun commentaire"
            showSearch={true}
            searchPlaceholder="Rechercher un commentaire..."
            searchField={["text"]}
            selectedRowId={selectedCommentId}
            onRowClick={(row: Comment) => setSelectedCommentId(row.id)}
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le commentaire</DialogTitle>
            <DialogDescription>
              Type: <strong>{editingComment?.type}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="edit-textarea" className="text-sm font-medium">
                Commentaire
              </label>
              <Textarea
                id="edit-textarea"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                maxLength={255}
                rows={4}
              />
              <p className="text-xs text-muted-foreground text-right">
                {editText.length}/255 caractères
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditComment} disabled={!editText.trim()}>
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
