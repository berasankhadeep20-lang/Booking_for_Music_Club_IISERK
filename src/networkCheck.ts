// IISERK is on NKN (National Knowledge Network) — 14.139.x.x block
// 🔧 Update IISERK_IP_PREFIX below after checking your campus public IP at https://api.ipify.org
const IISERK_IP_PREFIXES = [
  '14.139.',   // NKN block (common to IITs/IISERs/IISc)
  '203.129.',  // alternate NKN allocation seen at some campuses
]

export async function getPublicIP(): Promise<string> {
  try {
    const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(5000) })
    const data = await res.json()
    return data.ip as string
  } catch {
    throw new Error('Could not detect your IP address. Check your connection.')
  }
}

export function isIISERKIP(ip: string): boolean {
  return IISERK_IP_PREFIXES.some(prefix => ip.startsWith(prefix))
}

export async function checkOnCampusNetwork(): Promise<{ ok: boolean; ip: string }> {
  const ip = await getPublicIP()
  return { ok: isIISERKIP(ip), ip }
}
