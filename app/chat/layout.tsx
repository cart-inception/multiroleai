import type React from "react"
import { redirect } from "next/navigation"
import { ChatSidebar } from "@/components/chat-sidebar"
import { getUserIdFromToken } from "@/app/actions/auth"

export default async function ChatLayout({
  children,
  searchParams
}: {
  children: React.ReactNode
  searchParams: { token?: string }
}) {
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

  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar token={token} />
      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  )
}

