"use server"

import { db } from "@/lib/db"
import { hash, compare } from "bcrypt"
import { redirect } from "next/navigation"
import crypto from "crypto"
import { cookies } from "next/headers"

// Create a map of auth tokens in memory (not persisted)
interface TokenData {
  userId: string;
  expires: Date;
}

// In a real app, you'd use Redis or another persistence mechanism
const tokenStore = new Map<string, TokenData>();

// Helper function to generate a token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
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
    const token = generateToken();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    // Store token in memory
    tokenStore.set(token, {
      userId: user.id,
      expires
    });
    
    // Redirect with token as query parameter
    redirect(`/chat?token=${token}`);
    
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
    const token = generateToken();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    // Store token in memory
    tokenStore.set(token, {
      userId: user.id,
      expires
    });
    
    // Redirect with token as query parameter
    redirect(`/chat?token=${token}`);
    
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "An error occurred during registration" }
  }
}

export async function logout() {
  redirect("/");
}

// Get user ID from token (for other actions)
export function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null;
  
  const tokenData = tokenStore.get(token);
  if (!tokenData) return null;
  
  if (tokenData.expires < new Date()) {
    tokenStore.delete(token);
    return null;
  }
  
  return tokenData.userId;
}