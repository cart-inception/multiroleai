import type React from "react"
import { redirect } from "next/navigation"
import { ChatSidebar } from "@/components/chat-sidebar"
import { getUserIdFromToken } from "@/app/actions/auth"
import { cookies } from "next/headers"

export default async function ChatLayout({
  children,
  searchParams = {}
}: {
  children: React.ReactNode
  searchParams?: { token?: string }
}) {
  // Check if user is logged in, first from search params then from cookies
  const tokenFromParams = searchParams?.token
  const cookieStore = cookies()
  const tokenFromCookie = cookieStore.get('authToken')?.value
  const token = tokenFromParams || tokenFromCookie
  
  if (!token) {
    redirect("/login")
  }
  
  // Verify token is valid
  const userId = await getUserIdFromToken(token)
  
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

