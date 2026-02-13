import { NextResponse } from "next/server"
import { createPublicClient, http } from "viem"
import { base } from "viem/chains"
import { readFile, writeFile } from "fs/promises"
import path from "path"

const RPC_URL = process.env.RPC_URL as string

if (!RPC_URL) {
  throw new Error("Missing RPC_URL")
}

const publicClient = createPublicClient({
  chain: base,
  transport: http(RPC_URL),
})

// Basit JSON storage (production'da DB olur)
const DB_PATH = path.join(process.cwd(), "data/users.json")

type User = {
  wallet: string
  xp: number
  missions: string[]
}

async function loadUsers(): Promise<User[]> {
  try {
    const file = await readFile(DB_PATH, "utf-8")
    return JSON.parse(file)
  } catch {
    return []
  }
}

async function saveUsers(users: User[]) {
  await writeFile(DB_PATH, JSON.stringify(users, null, 2))
}

// XP mapping
const missionXP: Record<string, number> = {
  gas_warrior: 20,
  onchain_curious: 15,
  first_tx: 15,
}

export async function POST(req: Request) {
  try {
    const { wallet, missionId } = await req.json()

    if (!wallet || !missionId) {
      return NextResponse.json(
        { error: "Missing wallet or missionId" },
        { status: 400 }
      )
    }

    const users = await loadUsers()
    let user = users.find(u => u.wallet.toLowerCase() === wallet.toLowerCase())

    if (!user) {
      user = { wallet, xp: 0, missions: [] }
      users.push(user)
    }

    // 🔥 Zaten yapılmış mı?
    if (user.missions.includes(missionId)) {
      return NextResponse.json(
        { error: "Mission already completed" },
        { status: 400 }
      )
    }

    // 🔥 ZİNCİR KONTROLÜ
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

    // XP ekle
    const earnedXP = missionXP[missionId] || 10
    user.xp += earnedXP
    user.missions.push(missionId)

    await saveUsers(users)

    return NextResponse.json({
      success: true,
      xp: user.xp,
      missions: user.missions,
    })

  } catch (err: any) {
    console.error("VERIFY ERROR:", err)

    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    )
  }
}
