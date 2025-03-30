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
      const cookieStore = await cookies();
      cookieStore.set({
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

export async function register(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!name || !email || !password) {
    return { error: "All fields are required" }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  try {
    // In a real app, you would create the user in your database here
    // For now, we'll simulate a successful registration

    // Create a token (in a real app, use a proper JWT)
    const token = createHash('sha256').update(`${email}-${Date.now()}`).digest('hex')
    
    // Store the token in a secure, HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'authToken',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    })

    // Redirect to the chat page after successful registration
    redirect(`/chat?token=${token}`)
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "An unexpected error occurred during registration" }
  }
}