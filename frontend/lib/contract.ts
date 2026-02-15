import { getWalletClient } from "@wagmi/core"
import { config } from "./wallet"
import CastQuestABI from "../abi/CastQuestBadges.json"

export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

export async function mintBadge(badgeId: number) {
  const walletClient = await getWalletClient(config)

  if (!walletClient) {
    throw new Error("Wallet not connected")
  }

  const [account] = await walletClient.getAddresses()

  const tokenURI = `https://castquest.vercel.app/api/badges/${badgeId}`

  const hash = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: CastQuestABI,
    functionName: "mintBadge",
    args: [account, tokenURI],
    account,
  })

  return hash
}
