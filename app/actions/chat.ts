"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { getGeminiResponse } from "@/lib/gemini"
import { revalidatePath } from "next/cache"

export async function createChat() {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const chat = await db.chat.create({
    data: {
      userId: session.user.id,
      title: "New Chat",
    },
  })

  revalidatePath("/chat")
  return chat
}

export async function getChatById(chatId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const chat = await db.chat.findUnique({
    where: {
      id: chatId,
      userId: session.user.id,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  })

  return chat
}

export async function getUserChats() {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const chats = await db.chat.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  return chats
}

export async function sendMessage(chatId: string, content: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Get the chat and verify ownership
  const chat = await db.chat.findUnique({
    where: {
      id: chatId,
      userId: session.user.id,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  })

  if (!chat) {
    throw new Error("Chat not found")
  }

  // Create user message
  const userMessage = await db.message.create({
    data: {
      content,
      role: "user",
      chatId,
    },
  })

  // Update chat title if it's the first message
  if (chat.messages.length === 0) {
    await db.chat.update({
      where: { id: chatId },
      data: {
        title: content.slice(0, 30) + (content.length > 30 ? "..." : ""),
      },
    })
  }

  // Get all messages for context
  const messages = [...chat.messages, userMessage].map((msg) => ({
    role: msg.role,
    content: msg.content,
  }))

  // Get response from Gemini
  const assistantResponse = await getGeminiResponse(messages)

  // Save assistant message
  await db.message.create({
    data: {
      content: assistantResponse,
      role: "assistant",
      chatId,
    },
  })

  revalidatePath(`/chat/${chatId}`)
  return { userMessage, assistantResponse }
}

export async function deleteChat(chatId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  await db.chat.delete({
    where: {
      id: chatId,
      userId: session.user.id,
    },
  })

  revalidatePath("/chat")
}

