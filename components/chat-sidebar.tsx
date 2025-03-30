"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getUserChats, createChat, deleteChat } from "@/app/actions/chat"
import { logout } from "@/app/actions/auth"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { PlusIcon, TrashIcon, LogOutIcon, MenuIcon, XIcon } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

interface Chat {
  id: string
  title: string | null
  updatedAt: Date
}

export function ChatSidebar() {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const { isMobile, isOpen, setIsOpen } = useMobile()

  useEffect(() => {
    async function loadChats() {
      try {
        const userChats = await getUserChats()
        setChats(userChats)
      } catch (error) {
        console.error("Failed to load chats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadChats()
  }, [pathname])

  async function handleCreateChat() {
    try {
      const newChat = await createChat()
      setChats((prevChats) => [newChat, ...prevChats])
    } catch (error) {
      console.error("Failed to create chat:", error)
    }
  }

  async function handleDeleteChat(chatId: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    try {
      await deleteChat(chatId)
      setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId))
    } catch (error) {
      console.error("Failed to delete chat:", error)
    }
  }

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold">Chats</h2>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <XIcon className="h-5 w-5" />
          </Button>
        )}
      </div>
      <div className="px-4 pb-2">
        <form action={handleCreateChat}>
          <Button className="w-full justify-start" type="submit">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </form>
      </div>
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 p-2">
          {loading ? (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">Loading chats...</div>
          ) : chats.length === 0 ? (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">No chats yet</div>
          ) : (
            chats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                  pathname === `/chat/${chat.id}` ? "bg-accent text-accent-foreground" : ""
                }`}
                onClick={() => isMobile && setIsOpen(false)}
              >
                <span className="line-clamp-1">{chat.title || "New Chat"}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100"
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </Link>
            ))
          )}
        </div>
      </ScrollArea>
      <div className="p-4">
        <form action={logout}>
          <Button variant="outline" className="w-full justify-start" type="submit">
            <LogOutIcon className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </form>
      </div>
    </>
  )

  return (
    <>
      {isMobile && (
        <Button variant="ghost" size="icon" className="absolute left-4 top-4 z-50" onClick={() => setIsOpen(true)}>
          <MenuIcon className="h-5 w-5" />
        </Button>
      )}
      {isMobile ? (
        <div
          className={`fixed inset-0 z-40 transform transition-transform ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full w-64 flex-col bg-background border-r">{sidebarContent}</div>
          {isOpen && <div className="absolute inset-0 z-[-1] bg-black/50" onClick={() => setIsOpen(false)} />}
        </div>
      ) : (
        <div className="flex h-full w-64 flex-col bg-background border-r">{sidebarContent}</div>
      )}
    </>
  )
}

