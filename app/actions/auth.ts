"use server"

import { signIn, signOut } from "@/auth"
import { db } from "@/lib/db"
import bcrypt from "bcrypt"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  try {
    await signIn("credentials", { email, password, redirect: false })
    redirect("/chat")
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid credentials" }
    }
    throw error
  }
}

export async function register(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string

  if (!email || !password || !name) {
    return { error: "All fields are required" }
  }

  const existingUser = await db.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return { error: "Email already in use" }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await db.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  })

  await signIn("credentials", { email, password, redirect: false })
  redirect("/chat")
}

export async function logout() {
  await signOut({ redirectTo: "/" })
}

