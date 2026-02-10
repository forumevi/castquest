export async function POST(req: Request) {
  const body = await req.json()
  const { missionId, wallet } = body

  if (!missionId || !wallet) {
    return new Response("Missing data", { status: 400 })
  }

  return Response.json({
    success: true,
    missionId,
    wallet,
    xpEarned: 20
  })
}
