import { NextResponse } from "next/server"
import { createWalletClient, http } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { base } from "viem/chains"
import CastQuestABI from "../../../abi/CastQuestBadges.json"
import type { Abi } from "viem"

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
    account, // ⭐ bunu ekledik
    address: process.env.CONTRACT_ADDRESS as `0x${string}`,
    abi: CastQuestABI as Abi, // ⭐ ABI tipini netleştirdik
    functionName: "mintBadge",
    args: [wallet as `0x${string}`, tokenURI],
    chain: base // ⭐ zinciri de açık veriyoruz
  })

  return NextResponse.json({ success: true, tx: hash })
}
