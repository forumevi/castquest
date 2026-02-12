"use client"
import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { translations, Lang } from "../../lib/i18n"

export default function Missions() {
  const { address, isConnected } = useAccount()

  const [missions, setMissions] = useState<any[]>([])
  const [completed, setCompleted] = useState<string[]>([])
  const [xp, setXp] = useState(0)
  const [lang, setLang] = useState<Lang>("en")
  const [minting, setMinting] = useState(false)
  const [minted, setMinted] = useState(false)

  useEffect(() => {
    fetch("/api/missions").then(res => res.json()).then(setMissions)

    const savedLang = localStorage.getItem("lang") as Lang
    if (savedLang) setLang(savedLang)

    const saved = localStorage.getItem("completedMissions")
    if (saved) setCompleted(JSON.parse(saved))

    const savedXp = localStorage.getItem("xp")
    if (savedXp) setXp(Number(savedXp))

    const savedMint = localStorage.getItem("genesisMinted")
    if (savedMint === "true") setMinted(true)
  }, [])

  const t = translations[lang]

  const completeMission = async (missionId: string) => {
    if (!isConnected || !address) {
      alert("Connect wallet first")
      return
    }

    const res = await fetch("/api/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ missionId, wallet: address })
    })

    const data = await res.json()

    if (data.success) {
      const updated = [...completed, missionId]
      setCompleted(updated)
      localStorage.setItem("completedMissions", JSON.stringify(updated))

      const newXp = xp + data.xpEarned
      setXp(newXp)
      localStorage.setItem("xp", String(newXp))
    }
  }

  const mintBadge = async () => {
    if (!address || minted) return

    try {
      setMinting(true)

      const res = await fetch("/api/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: address,
          badgeSlug: "genesis-explorer"
        })
      })

      const data = await res.json()

      if (data.success) {
        setMinted(true)
        localStorage.setItem("genesisMinted", "true")
      }

    } catch (err) {
      console.error(err)
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

      {/* Badge Unlock */}
      {xp >= 50 && (
        <div style={{ marginBottom: 20, padding: 16, border: "2px solid gold", borderRadius: 12 }}>
          <p>🏆 {t.badgeUnlocked}</p>
          <img src="/badges/genesis-explorer.png" width={120} />

          {!minted ? (
            <button
              onClick={mintBadge}
              disabled={minting || !isConnected}
              style={{ display: "block", marginTop: 10 }}
            >
              {minting ? "Minting..." : "Claim Genesis Badge"}
            </button>
          ) : (
            <button disabled style={{ display: "block", marginTop: 10 }}>
              ✅ Badge Minted
            </button>
          )}
        </div>
      )}

      {/* Missions */}
      {missions.map(m => {
        const isDone = completed.includes(m.id)

        return (
          <div key={m.id} style={{ border: "1px solid #333", padding: 12, marginBottom: 12 }}>
            <h3>{lang === "tr" ? m.title_tr : m.title_en}</h3>
            <p>{lang === "tr" ? m.description_tr : m.description_en}</p>

            {isDone ? (
              <button disabled>✅ {t.completed}</button>
            ) : (
              <button onClick={() => completeMission(m.id)} disabled={!isConnected}>
                {t.verify}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
