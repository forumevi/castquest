import { NextResponse } from "next/server"
import { createWalletClient, http } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { base } from "viem/chains"
import abi from "../../../abi/CastQuestBadges.json"

const account = privateKeyToAccount(process.env.OWNER_PRIVATE_KEY as `0x${string}`)

const client = createWalletClient({
  account,
  chain: base,
  transport: http()
})

export async function POST(req: Request) {
  const { wallet, badgeId } = await req.json()

  const tokenURI = `https://castquest.vercel.app/api/badges/${badgeId}`

  const hash = await client.writeContract({
    address: process.env.CONTRACT_ADDRESS as `0x${string}`,
    abi: CastQuestABI,
    functionName: "mintBadge",
    args: [wallet, tokenURI]
  })

  return NextResponse.json({ success: true, tx: hash })
}
