import { generateText } from "ai"
import { GoogleGenerativeAI } from "@ai-sdk/google"

const googleAI = GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

export async function getGeminiResponse(messages: { role: string; content: string }[]) {
  try {
    const formattedMessages = messages.map((message) => ({
      role: message.role === "user" ? "user" : "model",
      content: message.content,
    }))

    const { text } = await generateText({
      model: googleAI("gemini-1.5-pro"),
      messages: formattedMessages,
    })

    return text
  } catch (error) {
    console.error("Error calling Gemini API:", error)
    throw new Error("Failed to get response from Gemini")
  }
}

