import { NextResponse } from "next/server"
import { createWalletClient, http } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { base } from "viem/chains"
import CastQuestABI from "../../../abi/CastQuestBadges.json"

const PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY as `0x${string}`
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS as `0x${string}`
const RPC_URL = process.env.RPC_URL as string

if (!PRIVATE_KEY || !CONTRACT_ADDRESS || !RPC_URL) {
  throw new Error("Missing environment variables")
}

const account = privateKeyToAccount(PRIVATE_KEY)

const client = createWalletClient({
  account,
  chain: base,
  transport: http(RPC_URL), // 🔥 RPC artık zorunlu
})

export async function POST(req: Request) {
  try {
    const { wallet, badgeId } = await req.json()

    if (!wallet || !badgeId) {
      return NextResponse.json(
        { error: "Missing wallet or badgeId" },
        { status: 400 }
      )
    }

    const tokenURI = `https://castquest.vercel.app/api/badges/${badgeId}`

    const hash = await client.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CastQuestABI,
      functionName: "mintBadge",
      args: [wallet as `0x${string}`, tokenURI],
    })

    return NextResponse.json({ success: true, tx: hash })

  } catch (err: any) {
    console.error("MINT ERROR:", err)
    return NextResponse.json(
      { error: "Mint failed", details: err.message },
      { status: 500 }
    )
  }
}
