'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createHash } from 'crypto'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  try {
    // Replace this with your actual authentication logic
    // For demonstration, let's say these credentials are valid
    if (email === "user@example.com" && password === "password") {
      // Create a simple token (in a real app, use a proper JWT)
      const token = createHash('sha256').update(`${email}-${Date.now()}`).digest('hex')
      
      // Store the token in a secure, HTTP-only cookie
      cookies().set({
        name: 'authToken',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      })

      // Redirect to dashboard or chat page
      redirect(`/chat?token=${token}`)
    }

    return { error: "Invalid email or password" }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An unexpected error occurred" }
  }
}