import type React from "react"
import { redirect } from "next/navigation"
import { ChatSidebar } from "@/components/chat-sidebar"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  )
}

