export const runtime = 'nodejs'

export async function POST() {
  return new Response(JSON.stringify({ ok: true, exercise: '5-4-3-2-1-grounding', startedAt: Date.now() }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}


