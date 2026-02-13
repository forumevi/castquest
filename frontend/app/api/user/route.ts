import { NextResponse } from "next/server"

const userStore: Record<string, { xp: number; missions: string[] }> = {}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const wallet = searchParams.get("wallet")

  if (!wallet) {
    return NextResponse.json({ error: "Missing wallet" }, { status: 400 })
  }

  if (!userStore[wallet]) {
    userStore[wallet] = { xp: 0, missions: [] }
  }

  return NextResponse.json(userStore[wallet])
}

export async function POST(req: Request) {
  const { wallet, missionId, xpEarned } = await req.json()

  if (!wallet || !missionId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 })
  }

  if (!userStore[wallet]) {
    userStore[wallet] = { xp: 0, missions: [] }
  }

  if (!userStore[wallet].missions.includes(missionId)) {
    userStore[wallet].missions.push(missionId)
    userStore[wallet].xp += xpEarned
  }

  return NextResponse.json(userStore[wallet])
}
