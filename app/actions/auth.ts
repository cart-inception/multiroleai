'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createHash } from 'crypto'

export async function getUserIdFromToken(token: string) {
  // In a real app, you would verify the token (e.g., JWT verification)
  // For this example, we're just returning a mock user ID if the token exists
  if (!token) return null
  
  // This is a simplification. In a real app, you would decode the token
  // and extract the user ID from it.
  return 'user_' + token.substring(0, 8)
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  try {
    // For development purposes, accept any login
    // Remove this condition in production and replace with proper auth!
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

    // Return success with the URL to redirect to
    return { success: true, redirectUrl: `/chat?token=${token}` }
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

    // Return success with the URL to redirect to
    return { success: true, redirectUrl: `/chat?token=${token}` }
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "An unexpected error occurred during registration" }
  }
}

export async function logout() {
  // Clear the auth token cookie
  const cookieStore = await cookies()
  cookieStore.delete('authToken')
  
  // Redirect to the home page
  redirect('/')
}