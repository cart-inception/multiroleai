import { Button } from "@/components/ui/button"
import { deleteChat } from "@/app/actions/chat"
import { TrashIcon } from "lucide-react"

interface ChatHeaderProps {
  chat: {
    id: string
    title: string | null
  }
}

export function ChatHeader({ chat }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b px-4 py-2">
      <h2 className="text-lg font-semibold">{chat.title || "New Chat"}</h2>
      <form action={() => deleteChat(chat.id)}>
        <Button variant="ghost" size="icon" type="submit">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}

