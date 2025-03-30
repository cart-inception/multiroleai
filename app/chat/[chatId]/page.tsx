import { getChatById } from "@/app/actions/chat"
import { redirect } from "next/navigation"
import { ChatHeader } from "@/components/chat-header"
import { ChatMessages } from "@/components/chat-messages"
import { ChatInput } from "@/components/chat-input"
import { getUserIdFromToken } from "@/app/actions/auth"

interface ChatPageProps {
  params: {
    chatId: string
  },
  searchParams: {
    token?: string
  }
}

export default async function ChatPage({ params, searchParams }: ChatPageProps) {
  // Check if user is logged in
  const token = searchParams.token
  
  if (!token) {
    redirect("/login")
  }
  
  // Verify token is valid
  const userId = getUserIdFromToken(token)
  
  if (!userId) {
    redirect("/login")
  }

  const chat = await getChatById(params.chatId, token)

  if (!chat) {
    redirect("/chat")
  }

  return (
    <div className="flex h-full flex-col">
      <ChatHeader chat={chat} />
      <ChatMessages messages={chat.messages} />
      <ChatInput chatId={chat.id} token={token} />
    </div>
  )
}

