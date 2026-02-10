import { NextResponse } from "next/server"
import { createWalletClient, http } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { base } from "viem/chains"
import CastQuestABI from "../../../abi/CastQuestBadges.json"

// ENV'deki private key BAŞINDA 0x OLMALI
const account = privateKeyToAccount(process.env.OWNER_PRIVATE_KEY as `0x${string}`)

const client = createWalletClient({
  account,
  chain: base,
  transport: http()
})

export async function POST(req: Request) {
  try {
    const { wallet, badgeSlug } = await req.json()

    if (!wallet || !badgeSlug) {
      return NextResponse.json({ error: "Missing wallet or badgeSlug" }, { status: 400 })
    }

    const tokenURI = `https://castquest.vercel.app/api/badges/${badgeSlug}`

    const hash = await client.writeContract({
      account,                 // 🔥 TS hatasını çözer
      chain: base,             // 🔥 TS hatasını çözer
      address: process.env.CONTRACT_ADDRESS as `0x${string}`,
      abi: CastQuestABI,
      functionName: "mintBadge",
      args: [wallet as `0x${string}`, tokenURI]
    })

    return NextResponse.json({ success: true, tx: hash })

  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: "Mint failed", details: err.message }, { status: 500 })
  }
}
