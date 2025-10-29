'use client'

import { useCallback, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Camera, FileUp, Brain, HeartPulse, Activity, Stethoscope, Send } from 'lucide-react'
import '@/frontend/css/mediscan.css'
import { ocrExtractPatientName } from '@/frontend/js/ocr'

type AnalyzeResult = {
  extractedText: string
  risks: Record<string, number>
  shap: Array<{ feature: string; contribution: number }>
  filename?: string
}

export default function MediScanPage() {
  const [active, setActive] = useState<'scan' | 'chat' | null>(null)

  // Scan flow state
  const [scanStage, setScanStage] = useState<'pick' | 'confirm' | 'report'>('pick')
  const [analyzeLoading, setAnalyzeLoading] = useState(false)
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [camOn, setCamOn] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)
  const [camError, setCamError] = useState<string | null>(null)

  // Chat flow state
  const [system, setSystem] = useState<'heart' | 'brain' | 'respiratory' | 'metabolic' | 'renal' | ''>('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [extra, setExtra] = useState('')
  const [chatReport, setChatReport] = useState<AnalyzeResult | null>(null)
  const [chatLoading, setChatLoading] = useState(false)

  const startCamera = useCallback(async () => {
    try {
      setCamError(null)
      const constraints: MediaStreamConstraints = {
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      if (videoRef.current) {
        // iOS/Safari: ensure inline playback without user gesture
        videoRef.current.muted = true
        ;(videoRef.current as any).playsInline = true
        videoRef.current.autoplay = true
        videoRef.current.srcObject = stream
        await new Promise<void>((resolve) => {
          const v = videoRef.current!
          if (v.readyState >= 2 && v.videoWidth > 0) return resolve()
          const onLoaded = () => { v.removeEventListener('loadedmetadata', onLoaded); resolve() }
          v.addEventListener('loadedmetadata', onLoaded)
        })
        await videoRef.current.play()
      }
      setCamOn(true)
    } catch (e: any) {
      setCamError(e?.message || 'Camera access failed. Please allow camera permissions and use HTTPS.')
      setCamOn(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setCamOn(false)
  }, [])

  const doAnalyzeBlob = async (blob: Blob, filename: string) => {
    setAnalyzeLoading(true)
    try {
      // Try client-side OCR for patient name (fallback to filename)
      const hintName = await ocrExtractPatientName(blob).catch(() => undefined)
      const form = new FormData()
      form.append('file', blob, filename)
      if (hintName) form.append('hintName', hintName)
      const res = await fetch('/api/mediscan/analyze', { method: 'POST', body: form })
      const data = (await res.json()) as AnalyzeResult
      setAnalyzeResult(data)
      setScanStage('confirm')
    } finally {
      setAnalyzeLoading(false)
      stopCamera()
    }
  }

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    await doAnalyzeBlob(f, f.name)
  }

  const capture = async () => {
    if (!videoRef.current || !canvasRef.current) return
    const v = videoRef.current
    // Ensure metadata is ready
    if (v.videoWidth === 0) {
      await new Promise<void>((resolve) => {
        const onLoaded = () => { v.removeEventListener('loadedmetadata', onLoaded); resolve() }
        v.addEventListener('loadedmetadata', onLoaded)
      })
    }
    const c = canvasRef.current
    c.width = v.videoWidth
    c.height = v.videoHeight
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.drawImage(v, 0, 0, c.width, c.height)
    const blob: Blob | null = await new Promise(resolve => c.toBlob(resolve, 'image/jpeg', 0.92))
    if (!blob) return
    await doAnalyzeBlob(blob, 'camera.jpg')
  }

  const confirmExtractedText = () => {
    setScanStage('report')
  }

  const submitChat = async () => {
    setChatLoading(true)
    try {
      const res = await fetch('/api/mediscan/chat-assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system, answers, extra }),
      })
      const data = (await res.json()) as AnalyzeResult
      setChatReport(data)
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-5xl py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-800">SentiHeal MediScan</h1>
          <p className="text-slate-600">Upload a prescription for analysis or use the guided symptom checker.</p>
        </div>
        <Tabs value={active ?? ''} onValueChange={(v) => setActive(v as any)} className="w-auto">
          <TabsList>
            <TabsTrigger value="scan"><Stethoscope className="w-4 h-4 mr-2" /> Scan</TabsTrigger>
            <TabsTrigger value="chat"><Brain className="w-4 h-4 mr-2" /> Chatbot</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {!active && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center"><Stethoscope className="w-5 h-5 mr-2" /> Scan My Prescription</CardTitle>
              <CardDescription>Upload a PDF/Image or use camera. Confirm text, then get risk analysis.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setActive('scan')}>Open Scan</Button>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center"><Brain className="w-5 h-5 mr-2" /> Check My Symptoms</CardTitle>
              <CardDescription>Guided triage: pick body system, answer questions, review risks.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" onClick={() => setActive('chat')}>Open Chatbot</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {active === 'scan' && (
        <Card>
          <CardHeader>
            <CardTitle>Scan Flow</CardTitle>
            <CardDescription>Step 1: Upload or Camera → Step 2: Confirm Text → Step 3: Report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {scanStage === 'pick' && (
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="upload"><FileUp className="w-4 h-4 mr-2" /> Upload</TabsTrigger>
                  <TabsTrigger value="camera"><Camera className="w-4 h-4 mr-2" /> Camera</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="space-y-3">
                  <Input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={onFile} />
                </TabsContent>
                <TabsContent value="camera" className="space-y-3">
                  <div className="aspect-video bg-black/5 rounded flex items-center justify-center overflow-hidden">
                    {!camOn ? (
                      <Button onClick={startCamera}><Camera className="w-4 h-4 mr-2" /> Start Camera</Button>
                    ) : (
                      <video ref={videoRef} className="w-full h-full object-cover" muted playsInline autoPlay />
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  {camError && <div className="text-sm text-red-600">{camError}</div>}
                  <div className="flex gap-2">
                    <Button disabled={!camOn || analyzeLoading} onClick={capture}>Capture & Analyze</Button>
                    {camOn && <Button variant="outline" onClick={stopCamera}>Stop</Button>}
                    {!camOn && <Button variant="ghost" onClick={startCamera}>Retry</Button>}
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {scanStage === 'confirm' && analyzeResult && (
              <div className="space-y-4">
                <h3 className="font-semibold">Confirm Extracted Text</h3>
                <Textarea className="min-h-[200px]" defaultValue={analyzeResult.extractedText} />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setScanStage('pick')}>Back</Button>
                  <Button onClick={confirmExtractedText}>Looks Good</Button>
                </div>
              </div>
            )}

            {scanStage === 'report' && analyzeResult && (
              <div className="space-y-4">
                <h3 className="font-semibold">Multi‑Disease Risk Analysis {analyzeResult.filename ? `(from ${analyzeResult.filename})` : ''}</h3>
                <div className="text-sm text-muted-foreground">
                  {(() => {
                    const m = analyzeResult.extractedText.match(/Patient:\s*(.+)/)
                    return m ? `Patient: ${m[1]}` : null
                  })()}
                </div>
                <div className="space-y-1">
                  {Object.entries(analyzeResult.risks).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span className="capitalize">{k.replaceAll('_', ' ')}</span>
                      <span>{Math.round(v * 100)}%</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Top Reasons (SHAP)</h4>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    {analyzeResult.shap.map((s, i) => (
                      <li key={i}>{s.feature}: {s.contribution > 0 ? '+' : ''}{s.contribution.toFixed(2)}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {active === 'chat' && (
        <Card>
          <CardHeader>
            <CardTitle>Symptom Checker</CardTitle>
            <CardDescription>Pick a system, answer a few targeted questions, add anything extra, then get a risk report.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <Button variant={system === 'heart' ? 'default' : 'outline'} onClick={() => setSystem('heart')}><HeartPulse className="w-4 h-4 mr-2" /> Heart</Button>
              <Button variant={system === 'brain' ? 'default' : 'outline'} onClick={() => setSystem('brain')}><Activity className="w-4 h-4 mr-2" /> Brain</Button>
              <Button variant={system === 'metabolic' ? 'default' : 'outline'} onClick={() => setSystem('metabolic')}>Metabolic</Button>
              <Button variant={system === 'renal' ? 'default' : 'outline'} onClick={() => setSystem('renal')}>Renal</Button>
            </div>

            {system && (
              <div className="space-y-4">
                {system === 'heart' && (
                  <div className="grid md:grid-cols-2 gap-3">
                    <Input placeholder="Chest pain? duration/intensity" onChange={(e) => setAnswers(a => ({ ...a, chestPain: e.target.value }))} />
                    <Input placeholder="Shortness of breath? when" onChange={(e) => setAnswers(a => ({ ...a, sob: e.target.value }))} />
                    <Input placeholder="BP if known" onChange={(e) => setAnswers(a => ({ ...a, bp: e.target.value }))} />
                    <Input placeholder="Family history of heart disease?" onChange={(e) => setAnswers(a => ({ ...a, famHx: e.target.value }))} />
                  </div>
                )}
                {system === 'brain' && (
                  <div className="grid md:grid-cols-2 gap-3">
                    <Input placeholder="Headache: location/intensity" onChange={(e) => setAnswers(a => ({ ...a, headache: e.target.value }))} />
                    <Input placeholder="Dizziness/vision issues?" onChange={(e) => setAnswers(a => ({ ...a, neuro: e.target.value }))} />
                    <Input placeholder="Any weakness/numbness?" onChange={(e) => setAnswers(a => ({ ...a, focal: e.target.value }))} />
                    <Input placeholder="Recent trauma?" onChange={(e) => setAnswers(a => ({ ...a, trauma: e.target.value }))} />
                  </div>
                )}
                {system === 'respiratory' && (
                  <div className="grid md:grid-cols-2 gap-3">
                    <Input placeholder="Cough: dry/productive" onChange={(e) => setAnswers(a => ({ ...a, cough: e.target.value }))} />
                    <Input placeholder="Wheezing/asthma/COPD?" onChange={(e) => setAnswers(a => ({ ...a, wheeze: e.target.value }))} />
                    <Input placeholder="Fever/night sweats?" onChange={(e) => setAnswers(a => ({ ...a, fever: e.target.value }))} />
                    <Input placeholder="Smoking status" onChange={(e) => setAnswers(a => ({ ...a, smoke: e.target.value }))} />
                  </div>
                )}
                {system === 'metabolic' && (
                  <div className="grid md:grid-cols-2 gap-3">
                    <Input placeholder="Thirst/urination changes?" onChange={(e) => setAnswers(a => ({ ...a, polyuria: e.target.value }))} />
                    <Input placeholder="Weight change/appetite?" onChange={(e) => setAnswers(a => ({ ...a, weight: e.target.value }))} />
                    <Input placeholder="Glucose if known" onChange={(e) => setAnswers(a => ({ ...a, glucose: e.target.value }))} />
                    <Input placeholder="Fatigue levels" onChange={(e) => setAnswers(a => ({ ...a, fatigue: e.target.value }))} />
                  </div>
                )}
                {system === 'renal' && (
                  <div className="grid md:grid-cols-2 gap-3">
                    <Input placeholder="Swelling (legs/face)?" onChange={(e) => setAnswers(a => ({ ...a, edema: e.target.value }))} />
                    <Input placeholder="Urine changes (color/volume)?" onChange={(e) => setAnswers(a => ({ ...a, urine: e.target.value }))} />
                    <Input placeholder="Creatinine if known" onChange={(e) => setAnswers(a => ({ ...a, creatinine: e.target.value }))} />
                    <Input placeholder="BP if known" onChange={(e) => setAnswers(a => ({ ...a, bp: e.target.value }))} />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium">Anything else you want to add?</label>
                  <Textarea placeholder="Additional symptoms, timelines, meds..." value={extra} onChange={(e) => setExtra(e.target.value)} />
                </div>
                <div className="flex justify-end">
                  <Button disabled={!system || chatLoading} onClick={submitChat}><Send className="w-4 h-4 mr-2" /> Get Analysis</Button>
                </div>
              </div>
            )}

            {chatReport && (
              <div className="space-y-4">
                <h3 className="font-semibold">Risk Analysis</h3>
                <div className="space-y-1">
                  {Object.entries(chatReport.risks).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span className="capitalize">{k.replaceAll('_', ' ')}</span>
                      <span>{Math.round(v * 100)}%</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Top Reasons (SHAP)</h4>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    {chatReport.shap.map((s, i) => (
                      <li key={i}>{s.feature}: {s.contribution > 0 ? '+' : ''}{s.contribution.toFixed(2)}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ---- OCR utilities (client-side, best-effort) ----
async function ensureTesseractLoaded(): Promise<any> {
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


function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}


