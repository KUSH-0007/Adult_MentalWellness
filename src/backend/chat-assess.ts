export type ChatAssessOutput = {
  extractedText: string
  risks: Record<string, number>
  shap: Array<{ feature: string; contribution: number }>
}

export function assess(system: string, answers?: Record<string, string>, extra?: string): ChatAssessOutput {
  const base: Record<string, number> = {
    heart_failure_risk: 0.12,
    ckd_risk: 0.1,
    diabetes_risk: 0.1,
    copd_risk: 0.08,
    hypertension_risk: 0.12,
    stroke_risk: 0.08,
  }
  const txt = `${JSON.stringify(answers || {})} ${extra || ''}`.toLowerCase()
  const bump = (k: string, v: number) => (base[k] = Math.min(0.99, Math.max(0, base[k] + v)))

  if (system === 'heart') {
    if (txt.includes('chest') || txt.includes('angina')) bump('heart_failure_risk', 0.25)
    if (txt.includes('bp') || txt.includes('hypertension')) bump('hypertension_risk', 0.2)
    if (txt.includes('sob') || txt.includes('breath')) bump('heart_failure_risk', 0.15)
    if (txt.includes('family') && txt.includes('heart')) bump('heart_failure_risk', 0.1)
  }
  if (system === 'brain') {
    if (txt.includes('headache') || txt.includes('migraine')) bump('stroke_risk', 0.15)
    if (txt.includes('dizzy') || txt.includes('vision') || txt.includes('weakness')) bump('stroke_risk', 0.2)
    if (txt.includes('trauma')) bump('stroke_risk', 0.1)
  }
  if (system === 'respiratory') {
    if (txt.includes('cough')) bump('copd_risk', 0.15)
    if (txt.includes('wheeze') || txt.includes('asthma')) bump('copd_risk', 0.2)
    if (txt.includes('smoke')) bump('copd_risk', 0.25)
    if (txt.includes('fever')) bump('copd_risk', 0.05)
  }
  if (system === 'metabolic') {
    if (txt.includes('thirst') || txt.includes('urination') || txt.includes('polyuria')) bump('diabetes_risk', 0.25)
    if (txt.includes('glucose') || txt.includes('sugar')) bump('diabetes_risk', 0.2)
    if (txt.includes('weight')) bump('diabetes_risk', 0.1)
  }
  if (system === 'renal') {
    if (txt.includes('edema') || txt.includes('swelling')) bump('ckd_risk', 0.2)
    if (txt.includes('urine')) bump('ckd_risk', 0.15)
    if (txt.includes('creatinine')) bump('ckd_risk', 0.25)
    if (txt.includes('bp')) bump('hypertension_risk', 0.1)
  }

  const shap = Object.keys(base)
    .map(k => ({ feature: k.replace('_risk', ''), contribution: +(base[k] - 0.1).toFixed(2) }))
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 5)

  return { extractedText: system, risks: base, shap }
}


