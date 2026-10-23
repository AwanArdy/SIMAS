const TOKEN_KEY = 'simas_token'

export class AppError extends Error {
  code: string
  status: number

  constructor(code: string, message: string, status: number) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.status = status
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
}

/**
 * Fetch wrapper ke REST API SIMAS.
 * Mengembalikan `body.data` pada response sukses; melempar AppError jika gagal.
 */
export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  const baseUrl = getApiBaseUrl()

  let res: Response
  try {
    res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    })
  } catch {
    throw new AppError(
      'NETWORK_ERROR',
      'Tidak dapat terhubung ke server. Periksa koneksi atau pastikan backend berjalan.',
      0,
    )
  }

  let body: {
    success?: boolean
    data?: T
    error?: { code?: string; message?: string }
    message?: string
  }

  try {
    body = await res.json()
  } catch {
    throw new AppError('PARSE_ERROR', 'Respons server tidak valid', res.status)
  }

  if (!res.ok || body.success === false) {
    // Token expired / invalid — clear session so route guards redirect to login
    if (res.status === 401 && path !== '/auth/login') {
      setToken(null)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('simas:unauthorized'))
      }
    }

    const code = body.error?.code || (res.status === 401 ? 'UNAUTHORIZED' : 'UNKNOWN_ERROR')
    const message =
      body.error?.message ||
      body.message ||
      (res.status === 401
        ? 'Sesi berakhir atau tidak terautentikasi. Silakan login ulang.'
        : 'Terjadi kesalahan pada server')

    throw new AppError(code, message, res.status)
  }

  return body.data as T
}
