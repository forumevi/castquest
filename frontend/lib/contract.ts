import { createWalletClient, http } from "viem"
import { base } from "viem/chains"
import CastQuestABI from "../abi/CastQuestBadges.json"

export const CONTRACT_ADDRESS =
  "0x6DFb96a740270A066b7e370B0B99730E2920BE83" as `0x${string}`

export async function mintBadge(
  walletClient: any,
  badgeId: number,
  userAddress: `0x${string}`
) {

  if (!walletClient) {
    throw new Error("Wallet client not found")
  }

  const tokenURI =
    `https://castquest.vercel.app/api/badges/${badgeId}`

  const hash = await walletClient.writeContract({

    account: walletClient.account,   // ✅ REQUIRED
    chain: base,                     // ✅ REQUIRED FIX

    address: CONTRACT_ADDRESS,

    abi: CastQuestABI,

    functionName: "mintBadge",

    args: [
      userAddress,
      tokenURI
    ],

  })

  return hash
}
