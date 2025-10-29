export const runtime = 'nodejs'

export async function POST() {
  // Placeholder: record start event or trigger backend workflow
  return new Response(JSON.stringify({ ok: true, exercise: 'box-breathing', startedAt: Date.now() }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}


