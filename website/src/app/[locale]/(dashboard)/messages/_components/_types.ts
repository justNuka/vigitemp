/**
 * Types aligned with the real API responses from:
 * - GET /api/chat/conversations         → ConversationSummary[]
 * - GET /api/chat/conversations/[id]/messages → MessagesResponse
 * - GET /api/utilisateurs               → ApiUser[]
 * - POST /api/chat/conversations/direct → ConversationRef
 * - POST /api/chat/conversations/group  → GroupConversationRef
 */

export type ConversationSummary = {
  id: number
  type: "dm" | "group"
  name: string
  dmKey: string | null
  lastMessage: {
    id: number
    content: string
    senderId: number
    senderName: string
    createdAt: string // ISO string
  } | null
  unreadCount: number // always 0 in V1; we derive unread state from senderId
}

export type MessageItem = {
  id: number
  conversationId: number
  senderId: number
  senderName: string
  senderInitials: string
  senderAvatarSrc: string | null
  content: string
  createdAt: string // ISO string
  updatedAt: string | null // ISO string or null
}

export type MessagesResponse = {
  messages: MessageItem[]
  nextCursor: number | undefined
}

export type ApiUser = {
  id: number
  username: string
  displayName: string
  role: string
  status: string
  createdAt: string | null
  email: string | null
  avatar: string | null
}

export type ConversationRef = {
  id: number
  type: string
  dmKey: string | null
}

export type GroupConversationRef = {
  id: number
  type: string
  titre: string | null
}
