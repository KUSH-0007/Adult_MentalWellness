import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { symptoms } = await req.json()
    if (!Array.isArray(symptoms) || symptoms.length === 0) {
      return new Response(JSON.stringify({ error: 'symptoms array required' }), { status: 400 })
    }
    return new Response(JSON.stringify({ ok: true, received: symptoms }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'unexpected error' }), { status: 500 })
  }
}


