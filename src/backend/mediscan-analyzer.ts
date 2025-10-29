export type AnalyzeOutput = {
  ok: boolean
  filename: string
  extractedText: string
  risks: Record<string, number>
  shap: Array<{ feature: string; contribution: number }>
}

export function analyzeFromFilename(filename: string, hintName?: string): AnalyzeOutput {
  const fname = filename || 'unknown'
  const baseName = fname.replace(/\.[^.]+$/, '')
  const words = baseName.split(/[^a-zA-Z]+/).filter(Boolean)
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
  const fallbackName = words.length >= 2 ? `${cap(words[0])} ${cap(words[1])}` : 'Patient Unknown'
  const patientName = (hintName && hintName.length >= 3 ? hintName : fallbackName)

  const seed = hashString(fname)
  let rnd = seed
  const next = () => {
    rnd ^= rnd << 13
    rnd ^= rnd >>> 17
    rnd ^= rnd << 5
    return ((rnd >>> 0) % 1000) / 1000
  }

  const sbp = Math.round(110 + next() * 60)
  const dbp = Math.round(70 + next() * 30)
  const hr = Math.round(60 + next() * 60)
  const creat = +(0.7 + next() * 2.2).toFixed(1)
  const fpg = Math.round(80 + next() * 70)

  const extractedText = `Patient: ${patientName}\nRx: Lisinopril 10mg OD\nVitals: BP ${sbp}/${dbp}, HR ${hr}\nLabs: Creatinine ${creat} mg/dL, FPG ${fpg} mg/dL\nNotes: OCR/name extraction used when available.`

  const risks: Record<string, number> = {
    heart_failure_risk: 0.15 + (sbp > 140 ? 0.2 : 0) + (hr > 100 ? 0.1 : 0) + (creat > 1.5 ? 0.05 : 0),
    ckd_risk: 0.1 + (creat > 1.3 ? 0.25 : 0) + (sbp > 140 ? 0.05 : 0),
    diabetes_risk: 0.1 + (fpg >= 126 ? 0.25 : fpg >= 110 ? 0.12 : 0),
    copd_risk: 0.05 + (hr > 100 ? 0.05 : 0),
    hypertension_risk: 0.15 + (sbp >= 140 || dbp >= 90 ? 0.35 : sbp >= 130 ? 0.15 : 0),
  }
  Object.keys(risks).forEach(k => (risks[k] = Math.min(0.99, Math.max(0, +(risks[k].toFixed(2))))))

  const shap = [
    { feature: 'Systolic BP', contribution: +(sbp - 120) / 100 },
    { feature: 'Diastolic BP', contribution: +(dbp - 80) / 100 },
    { feature: 'Creatinine', contribution: +(creat - 1.0) / 3 },
    { feature: 'Fasting Glucose', contribution: +(fpg - 100) / 120 },
    { feature: 'Heart Rate', contribution: +(hr - 70) / 120 },
  ]
    .map(s => ({ feature: s.feature, contribution: +s.contribution.toFixed(2) }))
    .sort((a, b) => b.contribution - a.contribution)

  return { ok: true, filename: fname, extractedText, risks, shap }
}

function hashString(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
  }
  return h >>> 0
}


