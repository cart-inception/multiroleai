import type React from "react"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { ChatSidebar } from "@/components/chat-sidebar"

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  )
}

