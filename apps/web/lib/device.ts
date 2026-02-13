/**
 * Device ID management for Multica Web
 * Consistent with copilot-search: stores raw UUID, encrypts when transmitting
 */

const DEVICE_ID_KEY = 'MULTICA_DEVICE_ID'

// SHA-256 hash function (using Web Crypto API)
async function sha256(text: string): Promise<string> {
  const buffer = new TextEncoder().encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Get or create Device ID (raw UUID format)
 * Stored in localStorage, encrypted only when transmitting
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return ''

  let deviceId = localStorage.getItem(DEVICE_ID_KEY)

  if (!deviceId) {
    deviceId = crypto.randomUUID()
    localStorage.setItem(DEVICE_ID_KEY, deviceId)
  }

  return deviceId
}

/**
 * Generate encrypted Device-Id header value
 * Algorithm (consistent with copilot-search):
 * 1. sha256(uuid).slice(0, 32) = hashedDeviceId
 * 2. sha256(hashedDeviceId).slice(0, 8) + hashedDeviceId = 40 chars
 */
export async function generateDeviceIdHeader(deviceId: string): Promise<string> {
  const hashedDeviceId = (await sha256(deviceId)).slice(0, 32)
  return (await sha256(hashedDeviceId)).slice(0, 8) + hashedDeviceId
}
