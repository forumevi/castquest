"use client"

import { useEffect, useState } from "react"
import { useAccount, useReadContract } from "wagmi"
import { translations, Lang } from "../../lib/i18n"

const CONTRACT_ADDRESS = "0xb1A1F63b77B45F279F465c8B3c65b131704F3939"

const ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const

export default function Missions() {
  const { address, isConnected } = useAccount()

  const [missions, setMissions] = useState<any[]>([])
  const [completed, setCompleted] = useState<string[]>([])
  const [xp, setXp] = useState(0)
  const [lang, setLang] = useState<Lang>("en")
  const [minting, setMinting] = useState(false)

  const { data: balance, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const hasNFT = balance ? Number(balance) > 0 : false

  useEffect(() => {
    fetch("/api/missions")
      .then(res => res.json())
      .then(setMissions)

    const savedLang = localStorage.getItem("lang") as Lang
    if (savedLang) setLang(savedLang)

    const saved = localStorage.getItem("completedMissions")
    if (saved) setCompleted(JSON.parse(saved))

    const savedXp = localStorage.getItem("xp")
    if (savedXp) setXp(Number(savedXp))
  }, [])

  const t = translations[lang]

  const completeMission = async (missionId: string) => {
    const wallet = address || "demo-user"

    const res = await fetch("/api/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ missionId, wallet }),
    })

    const data = await res.json()

    if (data.success) {
      const updated = [...completed, missionId]
      setCompleted(updated)
      localStorage.setItem("completedMissions", JSON.stringify(updated))

      const newXp = xp + data.xpEarned
      setXp(newXp)
      localStorage.setItem("xp", String(newXp))

      alert("+" + data.xpEarned + " XP 🎉")
    }
  }

  const handleMint = async () => {
    if (!address) {
      alert("Wallet not connected")
      return
    }

    try {
      setMinting(true)

      const res = await fetch("/api/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: address,
          badgeId: "1",

        }),
      })

      const data = await res.json()

      if (!data || !data.tx) {
        throw new Error("Transaction hash not returned")
      }

      alert("Mint successful! 🎉\nTX: " + data.tx)

      await refetch() // NFT durumunu güncelle
    } catch (err: any) {
      console.error(err)
      alert("Mint failed ❌\n" + (err.message || "Unknown error"))
    } finally {
      setMinting(false)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>{t.missions}</h2>

      <div style={{ marginBottom: 20 }}>
        <strong>{t.xp}: {xp}</strong>
      </div>

      {xp >= 50 && isConnected && (
        <div style={{ marginBottom: 20, padding: 12, border: "1px solid gold" }}>
          <p>🏆 {t.badgeUnlocked}</p>
          <img src="/badges/genesis-explorer.png" width={120} />

          {hasNFT ? (
            <button disabled>✅ Badge Minted</button>
          ) : (
            <button
              onClick={handleMint}
              disabled={minting}
              style={{ display: "block", marginTop: 10 }}
            >
              {minting ? "Minting..." : "Mint Badge NFT"}
            </button>
          )}
        </div>
      )}

      {missions.map((m) => {
        const isDone = completed.includes(m.id)

        return (
          <div
            key={m.id}
            style={{
              border: "1px solid #333",
              padding: 12,
              marginBottom: 12,
            }}
          >
            <h3>{lang === "tr" ? m.title_tr : m.title_en}</h3>
            <p>{lang === "tr" ? m.description_tr : m.description_en}</p>

            {isDone ? (
              <button disabled>✅ {t.completed}</button>
            ) : (
              <button onClick={() => completeMission(m.id)}>
                {t.verify}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
