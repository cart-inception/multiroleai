import { Button } from "@/components/ui/button"
import { createChat } from "@/app/actions/chat"

export default function ChatPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-4">
      <div className="mx-auto max-w-md space-y-4 text-center">
        <h1 className="text-3xl font-bold">Welcome to Gemini Chat</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Start a new conversation or select an existing chat from the sidebar.
        </p>
        <form action={createChat}>
          <Button type="submit" size="lg">
            New Chat
          </Button>
        </form>
      </div>
    </div>
  )
}

