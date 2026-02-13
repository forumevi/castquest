import { NextResponse } from "next/server"
import { createPublicClient, http, isAddress } from "viem"
import { base } from "viem/chains"

const RPC_URL = process.env.RPC_URL as string
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY as string

if (!RPC_URL) throw new Error("Missing RPC_URL")
if (!NEYNAR_API_KEY) throw new Error("Missing NEYNAR_API_KEY")

const publicClient = createPublicClient({
  chain: base,
  transport: http(RPC_URL),
})

const users = new Map<
  string,
  { xp: number; missions: string[] }
>()

const validMissions = [
  "first_mission",
  "reply_one",
  "reply_three",
  "share_castquest",
  "three_day_login",
  "first_tx",
  "two_contracts",
  "three_day_tx",
  "swap_and_share",
  "complete_five"
]

export async function POST(req: Request) {
  try {
    const { wallet, missionId } = await req.json()

    // =====================
    // BASIC VALIDATION
    // =====================

    if (!wallet || !missionId) {
      return NextResponse.json(
        { error: "Missing wallet or missionId" },
        { status: 400 }
      )
    }

    if (!isAddress(wallet)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      )
    }

    if (!validMissions.includes(missionId)) {
      return NextResponse.json(
        { error: "Invalid missionId" },
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

    let completed = false

    // =====================
    // ONCHAIN MISSIONS (REAL CHECK)
    // =====================

    if (
      missionId === "first_tx" ||
      missionId === "two_contracts" ||
      missionId === "three_day_tx"
    ) {
      const txCount = await publicClient.getTransactionCount({
        address: wallet as `0x${string}`,
      })

      console.log("Wallet:", wallet)
      console.log("Tx Count:", txCount)

      if (missionId === "first_tx" && txCount > 0) completed = true
      if (missionId === "two_contracts" && txCount >= 2) completed = true
      if (missionId === "three_day_tx" && txCount >= 3) completed = true
    }

    // =====================
    // SOCIAL MISSIONS (TEMPORARY OPEN)
    // =====================

    if (
      missionId === "reply_one" ||
      missionId === "reply_three" ||
      missionId === "share_castquest" ||
      missionId === "first_mission" ||
      missionId === "three_day_login"
    ) {
      completed = true
    }

    // =====================
    // MILESTONE
    // =====================

    if (missionId === "complete_five") {
      if (user.missions.length >= 5) {
        completed = true
      }
    }

    // =====================

    if (!completed) {
      return NextResponse.json(
        { error: "Mission requirements not met" },
        { status: 400 }
      )
    }

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
