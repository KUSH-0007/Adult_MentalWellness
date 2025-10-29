import { NextRequest } from 'next/server'
import { analyzeFromFilename } from '@/backend/mediscan-analyzer'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const hintName = (formData.get('hintName') as string | null) || undefined
    if (!file) {
      return new Response(JSON.stringify({ error: 'file required' }), { status: 400 })
    }

    const out = analyzeFromFilename(file.name || 'unknown', hintName)
    return new Response(JSON.stringify(out), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'unexpected error' }), { status: 500 })
  }
}


