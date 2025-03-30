"use server"

import { db } from "@/lib/db"
import { hash, compare } from "bcrypt"
import { redirect } from "next/navigation"
import crypto from "crypto"
import { cookies } from "next/headers"

// Simple JWT token generation
function generateToken(userId: string) {
  return `${userId}.${Date.now()}.${crypto.randomBytes(16).toString('hex')}`
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  try {
    // Find the user
    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user || !user.password) {
      return { error: "Invalid credentials" }
    }

    // Check if password matches
    const isPasswordValid = await compare(password, user.password)

    if (!isPasswordValid) {
      return { error: "Invalid credentials" }
    }

    // Generate a token
    const token = generateToken(user.id)
    
    // Store token in db and get the existing token if it exists
    let existingSession = await db.session.findFirst({
      where: { userId: user.id },
    })
    
    if (existingSession) {
      await db.session.update({
        where: { id: existingSession.id },
        data: {
          sessionToken: token,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      })
    } else {
      await db.session.create({
        data: {
          userId: user.id,
          sessionToken: token,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      })
    }
    
    // Set token in cookie - using this pattern to avoid issues with Next.js cookies()
    cookies().set("session-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      path: "/",
    })
    
    redirect("/chat")
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An error occurred during login" }
  }
}

export async function register(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string

  if (!email || !password || !name) {
    return { error: "All fields are required" }
  }

  try {
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { error: "Email already in use" }
    }

    const hashedPassword = await hash(password, 10)

    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    })

    // Generate a token
    const token = generateToken(user.id)
    
    // Create a session
    await db.session.create({
      data: {
        userId: user.id,
        sessionToken: token,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    })
    
    // Set token in cookie - using this pattern to avoid issues with Next.js cookies()
    cookies().set("session-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      path: "/",
    })
    
    redirect("/chat")
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "An error occurred during registration" }
  }
}

export async function logout() {
  // Get the cookie
  const token = cookies().get("session-token")?.value
  
  if (token) {
    try {
      // Find and delete the session
      const session = await db.session.findFirst({
        where: { sessionToken: token },
      })
      
      if (session) {
        await db.session.delete({
          where: { id: session.id },
        })
      }
    } catch (error) {
      console.error("Error deleting session:", error)
    }
  }
  
  // Delete the cookie
  cookies().delete("session-token")
  
  redirect("/")
}