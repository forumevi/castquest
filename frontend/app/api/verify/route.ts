import { NextResponse } from "next/server"
import { createPublicClient, http } from "viem"
import { base } from "viem/chains"

const RPC_URL = process.env.RPC_URL as string
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY as string

if (!RPC_URL) throw new Error("Missing RPC_URL")
if (!NEYNAR_API_KEY) throw new Error("Missing NEYNAR_API_KEY")

const publicClient = createPublicClient({
  chain: base,
  transport: http(RPC_URL),
})

// Memory store (temporary)
const users = new Map<
  string,
  { xp: number; missions: string[] }
>()

export async function POST(req: Request) {
  try {
    const { wallet, missionId } = await req.json()

    if (!wallet || !missionId) {
      return NextResponse.json(
        { error: "Missing wallet or missionId" },
        { status: 400 }
      )
    }

    const key = wallet.toLowerCase()

    if (!users.has(key)) {
      users.set(key, { xp: 0, missions: [] })
    }

    const user = users.get(key)!

    if (user.missions.includes(missionId)) {
      return NextResponse.json(
        { error: "Mission already completed" },
        { status: 400 }
      )
    }

    // =========================
    // CHAIN MISSIONS
    // =========================

    if (missionId === "gas_warrior") {
      const balance = await publicClient.getBalance({
        address: wallet as `0x${string}`,
      })

      if (balance <= 0n) {
        return NextResponse.json(
          { error: "No ETH balance detected" },
          { status: 400 }
        )
      }
    }

    if (missionId === "first_tx") {
      const txCount = await publicClient.getTransactionCount({
        address: wallet as `0x${string}`,
      })

      if (txCount === 0) {
        return NextResponse.json(
          { error: "No transactions found" },
          { status: 400 }
        )
      }
    }

    if (missionId === "onchain_curious") {
      const txCount = await publicClient.getTransactionCount({
        address: wallet as `0x${string}`,
      })

      if (txCount < 2) {
        return NextResponse.json(
          { error: "Not enough onchain interactions" },
          { status: 400 }
        )
      }
    }

    // =========================
    // FARCASTER MISSION
    // =========================

    if (missionId === "cast_quest") {
      const userRes = await fetch(
        `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${wallet}`,
        {
          headers: { api_key: NEYNAR_API_KEY },
        }
      )

      const userData = await userRes.json()
      const fcUsers = userData.users

      if (!fcUsers || fcUsers.length === 0) {
        return NextResponse.json(
          { error: "No Farcaster account linked" },
          { status: 400 }
        )
      }

      const fid = fcUsers[0].fid

      const castsRes = await fetch(
        `https://api.neynar.com/v2/farcaster/casts?fid=${fid}&limit=10`,
        {
          headers: { api_key: NEYNAR_API_KEY },
        }
      )

      const castsData = await castsRes.json()

      const hasCast = castsData.casts?.some((c: any) =>
        c.text?.toLowerCase().includes("#castquest")
      )

      if (!hasCast) {
        return NextResponse.json(
          { error: "Required cast not found" },
          { status: 400 }
        )
      }
    }

    // =========================
    // XP
    // =========================

    user.xp += 20
    user.missions.push(missionId)

    return NextResponse.json({
      success: true,
      xp: user.xp,
      missions: user.missions,
    })

  } catch (err) {
    console.error("VERIFY ERROR:", err)
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    )
  }
}
