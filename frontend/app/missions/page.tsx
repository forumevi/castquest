"use client"

import { useEffect, useState } from "react"
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
  useSwitchChain
} from "wagmi"

import { base } from "wagmi/chains"
import { translations, Lang } from "../../lib/i18n"

const CONTRACT_ADDRESS = "0x6DFb96a740270A066b7e370B0B99730E2920BE83"

const ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "mintBadge",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenURI", type: "string" },
    ],
    outputs: [],
  },
] as const

export default function MissionsPage() {

  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const [missions, setMissions] = useState<any[]>([])
  const [completed, setCompleted] = useState<string[]>([])
  const [xp, setXp] = useState(0)
  const [lang] = useState<Lang>("en")
  const [verifying, setVerifying] = useState<string | null>(null)

  const {
    writeContractAsync,
    data: hash,
    isPending
  } = useWriteContract()

  const { isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const { data: balance, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const hasNFT = balance ? Number(balance) > 0 : false
  const t = translations[lang]

  useEffect(() => {
    fetch("/api/missions")
      .then(res => res.json())
      .then(setMissions)
  }, [])

  useEffect(() => {
    if (!address) return

    fetch(`/api/user?wallet=${address}`)
      .then(res => res.json())
      .then(data => {
        setXp(data.xp)
        setCompleted(data.missions)
      })
  }, [address])

  useEffect(() => {
    if (isSuccess) {
      alert("Mint successful 🎉")
      refetch()
    }
  }, [isSuccess, refetch])

  const verifyMission = async (missionId: string) => {

    if (!address) {
      alert("Wallet not connected")
      return
    }

    try {

      setVerifying(missionId)

      const res = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet: address,
          missionId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error)
      }

      setXp(data.xp)
      setCompleted(data.missions)

    } catch (err: any) {

      alert(err.message)

    } finally {

      setVerifying(null)

    }

  }

  const handleMint = async () => {

    if (!isConnected || !address) {
      alert("Wallet not connected")
      return
    }

    try {

      // Base networke geç
      if (chainId !== base.id) {

        await switchChain({
          chainId: base.id
        })

        return
      }

      // zaten mint ettiyse engelle
      if (hasNFT) {
        alert("You already minted this badge")
        return
      }

      // mint
      await writeContractAsync({

        account: address,

        chain: base,

        address: CONTRACT_ADDRESS,

        abi: ABI,

        functionName: "mintBadge",

        args: [
          address,
          "https://castquest.vercel.app/api/badges/1"
        ],

      })

    } catch (err: any) {

      alert(err.shortMessage || err.message)

    }

  }

  return (

    <div style={{ padding: 24 }}>

      <h2>{t.missions}</h2>

      <div style={{ marginBottom: 20 }}>
        <strong>{t.xp}: {xp}</strong>
      </div>

      {xp >= 50 && isConnected && (

        <div style={{
          marginBottom: 20,
          padding: 12,
          border: "1px solid gold"
        }}>

          <p>🏆 {t.badgeUnlocked}</p>

          <img
            src="/badges/genesis-explorer.png"
            width={120}
          />

          {hasNFT ? (

            <button disabled>
              ✅ Badge Minted
            </button>

          ) : (

            <button
              onClick={handleMint}
              disabled={isPending}
            >
              {isPending ? "Minting..." : "Mint Badge NFT"}
            </button>

          )}

        </div>

      )}

      {missions.map((m) => {

        const isDone = completed.includes(m.id)
        const isLoading = verifying === m.id

        return (

          <div key={m.id}
            style={{
              border: "1px solid #333",
              padding: 12,
              marginBottom: 12,
            }}
          >

            <h3>
              {lang === "tr"
                ? m.title_tr
                : m.title_en}
            </h3>

            <p>
              {lang === "tr"
                ? m.description_tr
                : m.description_en}
            </p>

            {isDone ? (

              <button disabled>
                ✅ Completed
              </button>

            ) : (

              <button
                onClick={() => verifyMission(m.id)}
                disabled={isLoading}
              >
                {isLoading
                  ? "Verifying..."
                  : "Verify"}
              </button>

            )}

          </div>

        )

      })}

    </div>

  )

}
