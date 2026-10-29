/** WhatsApp Click to Chat link helper. No API key and no automatic sending. */
export function normalizeWhatsAppNumber(raw: string): string | null {
  let digits = raw.replace(/[^0-9]/g, '')
  // Input convenience for an Indonesian domestic number such as 08... .
  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`
  if (!/^[1-9][0-9]{7,14}$/.test(digits)) return null
  return digits
}

export function createWhatsAppLink(raw: string, text: string): string | null {
  const number = normalizeWhatsAppNumber(raw)
  if (!number) return null
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}
