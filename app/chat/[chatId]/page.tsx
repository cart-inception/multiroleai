import { getChatById } from "@/app/actions/chat"
import { redirect } from "next/navigation"
import { ChatHeader } from "@/components/chat-header"
import { ChatMessages } from "@/components/chat-messages"
import { ChatInput } from "@/components/chat-input"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

interface ChatPageProps {
  params: {
    chatId: string
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  // Check if user is logged in
  const token = cookies().get("session-token")?.value
  
  if (!token) {
    redirect("/login")
  }
  
  const session = await db.session.findFirst({
    where: { sessionToken: token },
    include: { user: true },
  })
  
  if (!session || session.expires < new Date()) {
    redirect("/login")
  }

  const chat = await getChatById(params.chatId)

  if (!chat) {
    redirect("/chat")
  }

  return (
    <div className="flex h-full flex-col">
      <ChatHeader chat={chat} />
      <ChatMessages messages={chat.messages} />
      <ChatInput chatId={chat.id} />
    </div>
  )
}

