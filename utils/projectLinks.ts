/** Limit external URLs to http(s), reject credentials and javascript:/data: schemes. */
export function safeWebUrl(value: string): string {
  if (!value) return ''
  try {
    const url = new URL(value)
    if (url.username || url.password) return ''
    const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
    if (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) return ''
    return url.toString()
  } catch { return '' }
}

/** Embedding is opt-in because some websites disallow iframe via CSP/X-Frame-Options. */
export function getEmbedUrl(project: { allowEmbed: boolean; demoUrl: string }): string {
  return project.allowEmbed ? safeWebUrl(project.demoUrl) : ''
}
