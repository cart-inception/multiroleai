"use server"

import { db } from "@/lib/db"
import { getGeminiResponse } from "@/lib/gemini"
import { revalidatePath } from "next/cache"
import { getUserIdFromToken } from "@/app/actions/auth"

// Helper function to get the current user ID
async function getCurrentUserId(token: string) {
  const userId = getUserIdFromToken(token)
  
  if (!userId) {
    throw new Error("Unauthorized")
  }
  
  return userId
}

export async function createChat(token: string) {
  const userId = await getCurrentUserId(token)
  
  const chat = await db.chat.create({
    data: {
      userId,
      title: "New Chat",
    },
  })

  revalidatePath("/chat")
  return chat
}

export async function getChatById(chatId: string, token: string) {
  const userId = await getCurrentUserId(token)

  const chat = await db.chat.findUnique({
    where: {
      id: chatId,
      userId,
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

export async function getUserChats(token: string) {
  const userId = await getCurrentUserId(token)

  const chats = await db.chat.findMany({
    where: {
      userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  return chats
}

export async function sendMessage(chatId: string, content: string, token: string) {
  const userId = await getCurrentUserId(token)

  // Get the chat and verify ownership
  const chat = await db.chat.findUnique({
    where: {
      id: chatId,
      userId,
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

export async function deleteChat(chatId: string, token: string) {
  const userId = await getCurrentUserId(token)

  await db.chat.delete({
    where: {
      id: chatId,
      userId,
    },
  })

  revalidatePath("/chat")
}