const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('tf_token')
}

export const setToken = (token: string): void => {
  localStorage.setItem('tf_token', token)
}

export const removeToken = (): void => {
  localStorage.removeItem('tf_token')
  localStorage.removeItem('tf_user')
  localStorage.removeItem('tf_workspaces')
  localStorage.removeItem('tf_current_workspace')
}

export const getUser = () => {
  if (typeof window === 'undefined') return null
  try {
    const token = getToken()
    if (!token) return null
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp * 1000 < Date.now()) {
      removeToken()
      return null
    }
    return payload
  } catch {
    return null
  }
}

export const isAuthenticated = (): boolean => getUser() !== null

export const logout = (): void => {
  removeToken()
  window.location.href = '/login'
}

export const apiRequest = async (
  path: string,
  options: RequestInit = {}
) => {
  const token = getToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  })
  return res
}

export const getCurrentWorkspace = () => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('tf_current_workspace')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const setCurrentWorkspace = (workspace: any) => {
  localStorage.setItem('tf_current_workspace', JSON.stringify(workspace))
}

export const getWorkspaces = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('tf_workspaces')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const setWorkspaces = (workspaces: any[]) => {
  localStorage.setItem('tf_workspaces', JSON.stringify(workspaces))
}