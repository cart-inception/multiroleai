import { auth } from "@/auth"
import { getChatById } from "@/app/actions/chat"
import { redirect } from "next/navigation"
import { ChatHeader } from "@/components/chat-header"
import { ChatMessages } from "@/components/chat-messages"
import { ChatInput } from "@/components/chat-input"

interface ChatPageProps {
  params: {
    chatId: string
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const session = await auth()

  if (!session?.user) {
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

