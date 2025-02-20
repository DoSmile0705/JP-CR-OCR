import { useAuth } from '@/app/contexts/AuthContext'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const { token } = useAuth()
  console.log(token)
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }


  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    // Handle unauthorized access
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/auth/signin'
    throw new Error('Unauthorized access')
  }

  return response
} 