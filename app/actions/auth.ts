"use server"

import { db } from "@/lib/db"
import { hash, compare } from "bcrypt"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

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

    // Create a session
    const session = await db.session.create({
      data: {
        userId: user.id,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        sessionToken: crypto.randomUUID(),
      },
    })

    // Set a cookie
    cookies().set({
      name: "next-auth.session-token",
      value: session.sessionToken,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60, // 30 days
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

    // Create a session
    const session = await db.session.create({
      data: {
        userId: user.id,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        sessionToken: crypto.randomUUID(),
      },
    })

    // Set a cookie
    cookies().set({
      name: "next-auth.session-token",
      value: session.sessionToken,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })

    redirect("/chat")
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "An error occurred during registration" }
  }
}

export async function logout() {
  cookies().delete("next-auth.session-token")
  redirect("/")
}

