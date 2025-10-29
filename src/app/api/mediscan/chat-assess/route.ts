import { NextRequest } from 'next/server'
import { assess } from '@/backend/chat-assess'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { system, answers, extra } = await req.json()
    if (!system) {
      return new Response(JSON.stringify({ error: 'system required' }), { status: 400 })
    }
    const out = assess(system, answers, extra)
    return new Response(JSON.stringify(out), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'unexpected error' }), { status: 500 })
  }
}


