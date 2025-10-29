export const runtime = 'nodejs'

export async function POST() {
  return new Response(JSON.stringify({ ok: true, exercise: 'mindful-observation', startedAt: Date.now() }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}


