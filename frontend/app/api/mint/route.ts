import { NextResponse } from "next/server"
import { createWalletClient, createPublicClient, http } from "viem"
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

const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(RPC_URL),
})

const publicClient = createPublicClient({
  chain: base,
  transport: http(RPC_URL),
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

    // Already minted check
    const balance = await (publicClient.readContract as any)({
      address: CONTRACT_ADDRESS,
      abi: CastQuestABI,
      functionName: "balanceOf",
      args: [wallet as `0x${string}`],
    }) as bigint

    if (Number(balance) > 0) {
      return NextResponse.json(
        { error: "User already minted this badge" },
        { status: 400 }
      )
    }

    const tokenURI = `https://castquest.vercel.app/api/badges/${badgeId}`

    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CastQuestABI,
      functionName: "mintBadge",
      args: [wallet as `0x${string}`, tokenURI],
    })

    // 🔥 BURASI ÖNEMLİ
    return NextResponse.json({
      success: true,
      hash: hash,   // frontend hash bekliyor
    })

  } catch (err: any) {
    console.error("MINT ERROR:", err)

    return NextResponse.json(
      {
        error: "Mint failed",
        details: err?.shortMessage || err?.message || "Unknown error",
      },
      { status: 500 }
    )
  }
}
