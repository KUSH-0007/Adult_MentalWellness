export async function ensureTesseractLoaded(): Promise<any> {
  const w = window as any
  if (w.Tesseract) return w.Tesseract
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js'
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load Tesseract'))
    document.body.appendChild(s)
  })
  return (window as any).Tesseract
}

export async function ocrExtractPatientName(blob: Blob): Promise<string | undefined> {
  try {
    const Tesseract = await ensureTesseractLoaded()
    const dataUrl = await blobToDataUrl(blob)
    const { data } = await Tesseract.recognize(dataUrl, 'eng', { logger: () => {} })
    const text: string = data?.text || ''
    const patterns = [
      /(patient|pt)\s*[:\-]?\s*([A-Za-z][A-Za-z\s']{1,60})/i,
      /(name)\s*[:\-]?\s*([A-Za-z][A-Za-z\s']{1,60})/i,
    ]
    for (const re of patterns) {
      const m = text.match(re)
      if (m && m[2]) {
        return sanitizeName(m[2])
      }
    }
    const cap = text.match(/\b([A-Z][a-z]+\s+[A-Z][a-z]+)\b/)
    if (cap) return sanitizeName(cap[1])
    return undefined
  } catch {
    return undefined
  }
}

export function sanitizeName(s: string): string {
  return s.replace(/[^A-Za-z\s']+/g, ' ').replace(/\s+/g, ' ').trim()
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}


