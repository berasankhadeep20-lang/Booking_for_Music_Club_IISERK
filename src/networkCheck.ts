// IISERK campus public IP prefix (verified via api.ipify.org on IISERK WiFi)
const IISERK_IP_PREFIXES = [
  '45.64.227.', // IISERK Kolkata campus WiFi
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
