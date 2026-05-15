export const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36'

export const fetchHtml = async (url: string, timeoutMs = 14000): Promise<string> => {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': BROWSER_UA, 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
      signal: AbortSignal.timeout(timeoutMs),
      redirect: 'follow',
    })
    if (!res.ok) return ''
    return await res.text()
  } catch {
    return ''
  }
}

export const checkCanIframe = async (url: string, timeoutMs = 10000): Promise<boolean> => {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': BROWSER_UA },
      signal: AbortSignal.timeout(timeoutMs),
      redirect: 'follow',
    })
    const xfo = (res.headers.get('x-frame-options') ?? '').trim()
    if (/^(deny|sameorigin)$/i.test(xfo)) return false
    const csp = res.headers.get('content-security-policy') ?? ''
    const cspMatch = csp.match(/frame-ancestors\s+([^;]+)/i)
    if (cspMatch) {
      const ancestors = cspMatch[1].trim()
      if (!ancestors.includes('*') && !ancestors.includes('https:')) return false
    }
    return true
  } catch {
    return true
  }
}
