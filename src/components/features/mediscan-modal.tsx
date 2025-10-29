'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Camera, FileUp, MessageCircle, Send, X } from 'lucide-react'

type MediScanModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MediScanModal({ open, onOpenChange }: MediScanModalProps) {
  const [activeFlow, setActiveFlow] = useState<'none' | 'scan' | 'chat'>('none')
  const [uploading, setUploading] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'bot' | 'user'; text: string }>>([
    { role: 'bot', text: "Hi, I am SentiHeal's health assistant. Please describe your symptoms, and I will take notes." },
  ])
  const [collectedSymptoms, setCollectedSymptoms] = useState<string[]>([])
  const [analysisResult, setAnalysisResult] = useState<null | { risks: Record<string, number>; shap: Array<{ feature: string; contribution: number }>; filename?: string }>(null)
  const [symptomResult, setSymptomResult] = useState<null | { received: string[] }>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraActive(true)
    } catch (e) {
      console.error('Camera error', e)
      setCameraActive(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setCameraActive(false)
  }, [])

  useEffect(() => {
    if (!open) {
      stopCamera()
      setActiveFlow('none')
    }
  }, [open, stopCamera])

  const capturePhotoAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const blob: Blob | null = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'))
    if (!blob) return
    await sendToAnalyze(blob, 'camera.jpg')
  }

  const sendToAnalyze = async (file: Blob, filename: string) => {
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file, filename)
      const res = await fetch('/api/mediscan/analyze', { method: 'POST', body: form })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Analyze failed')
      }
      const data = (await res.json()) as { risks: Record<string, number>; shap: Array<{ feature: string; contribution: number }>; filename?: string }
      setAnalysisResult({ risks: data.risks, shap: data.shap, filename: (data as any).filename })
      setErrorMsg(null)
      setActiveFlow('none')
    } catch (e) {
      setErrorMsg((e as any)?.message || 'Something went wrong')
    } finally {
      setUploading(false)
      stopCamera()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await sendToAnalyze(file, file.name)
  }

  const sendChat = () => {
    if (!chatInput.trim()) return
    const text = chatInput.trim()
    setChatMessages(prev => [...prev, { role: 'user', text }])
    // naive extraction: split by comma and sentence for demo
    const tokens = text
      .split(/[,.]/)
      .map(t => t.trim())
      .filter(Boolean)
    setCollectedSymptoms(prev => Array.from(new Set([...prev, ...tokens])))
    setChatMessages(prev => [
      ...prev,
      {
        role: 'bot',
        text: `Understood. I have noted: ${tokens.join(', ')}. Is there anything else?`,
      },
    ])
    setChatInput('')
  }

  const confirmChatAndSend = async () => {
    try {
      await fetch('/api/mediscan/symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: collectedSymptoms }),
      })
      setSymptomResult({ received: collectedSymptoms })
      setErrorMsg(null)
      setActiveFlow('none')
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>SentiHeal MediScan</DialogTitle>
          <DialogDescription>
            Choose how you'd like to continue.
          </DialogDescription>
        </DialogHeader>
        {activeFlow === 'none' && !analysisResult && !symptomResult && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Scan My Prescription</h3>
              <p className="text-sm text-muted-foreground mb-4">Upload a file or use your camera.</p>
              <div className="flex gap-2">
                <Button onClick={() => setActiveFlow('scan')}><FileUp className="w-4 h-4 mr-2" /> Upload/Camera</Button>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Check My Symptoms</h3>
              <p className="text-sm text-muted-foreground mb-4">Chat with our assistant.</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setActiveFlow('chat')}><MessageCircle className="w-4 h-4 mr-2" /> Open Chatbot</Button>
              </div>
            </div>
          </div>
        )}

        {activeFlow === 'scan' && (
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload File</TabsTrigger>
              <TabsTrigger value="camera">Use Camera</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="space-y-4">
              <Input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} />
              <Button disabled={uploading} variant="ghost" onClick={() => setActiveFlow('none')}><X className="w-4 h-4 mr-2" /> Back</Button>
            </TabsContent>
            <TabsContent value="camera" className="space-y-4">
              <div className="aspect-video bg-black/5 rounded-md flex items-center justify-center relative overflow-hidden">
                {!cameraActive ? (
                  <Button onClick={startCamera}><Camera className="w-4 h-4 mr-2" /> Start Camera</Button>
                ) : (
                  <video ref={videoRef} className="w-full h-full object-cover" />
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex gap-2">
                <Button onClick={capturePhotoAndAnalyze} disabled={!cameraActive || uploading}>Capture & Analyze</Button>
                {cameraActive && <Button variant="outline" onClick={stopCamera}>Stop</Button>}
                <Button variant="ghost" onClick={() => setActiveFlow('none')}><X className="w-4 h-4 mr-2" /> Back</Button>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {activeFlow === 'chat' && (
          <div className="grid gap-3">
            <div className="max-h-64 overflow-y-auto space-y-2 border rounded p-3 bg-muted/30">
              {chatMessages.map((m, idx) => (
                <div key={idx} className={m.role === 'bot' ? 'text-sm text-muted-foreground' : 'text-sm'}>
                  <strong className="mr-2">{m.role === 'bot' ? 'Bot' : 'You'}:</strong>
                  {m.text}
                </div>
              ))}
              {collectedSymptoms.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Noted: {collectedSymptoms.join(', ')}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Textarea value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Describe your symptoms..." />
              <Button onClick={sendChat}><Send className="w-4 h-4" /></Button>
            </div>
            <div className="flex gap-2 justify-between">
              <Button variant="ghost" onClick={() => setActiveFlow('none')}><X className="w-4 h-4 mr-2" /> Back</Button>
              <Button onClick={confirmChatAndSend} disabled={collectedSymptoms.length === 0}>Confirm & Send</Button>
            </div>
          </div>
        )}

        {(analysisResult || symptomResult) && (
          <div className="grid gap-4">
            {analysisResult && (
              <div className="space-y-3">
                <h3 className="font-semibold">Multi‑Disease Report {analysisResult.filename ? `(from ${analysisResult.filename})` : ''}</h3>
                <div className="space-y-1">
                  {Object.entries(analysisResult.risks)
                    .sort((a, b) => b[1] - a[1])
                    .map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm">
                        <span className="capitalize">{k.replaceAll('_', ' ')}</span>
                        <span>{Math.round(v * 100)}%</span>
                      </div>
                    ))}
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Top Reasons (SHAP)</h4>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    {analysisResult.shap.map((s, i) => (
                      <li key={i}>{s.feature}: {s.contribution > 0 ? '+' : ''}{s.contribution.toFixed(2)}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {symptomResult && (
              <div className="space-y-2">
                <h3 className="font-semibold">Symptoms Submitted</h3>
                <p className="text-sm text-muted-foreground">We received:</p>
                <div className="flex flex-wrap gap-2">
                  {symptomResult.received.map((s, i) => (
                    <span key={i} className="text-xs bg-muted px-2 py-1 rounded">{s}</span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">A clinician‑style analysis will be added when the real ML service is connected.</p>
              </div>
            )}
            {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => { setAnalysisResult(null); setSymptomResult(null); setErrorMsg(null); }}>New Scan</Button>
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}


