"use client"
import { useEffect, useState } from "react"
import { translations, Lang } from "../../lib/i18n"

export default function Missions() {
  const [missions, setMissions] = useState<any[]>([])
  const [completed, setCompleted] = useState<string[]>([])
  const [xp, setXp] = useState(0)
  const [lang, setLang] = useState<Lang>("en")

  useEffect(() => {
    fetch("/api/missions").then(res => res.json()).then(setMissions)

    const savedLang = localStorage.getItem("lang") as Lang
    if (savedLang) setLang(savedLang)

    const saved = localStorage.getItem("completedMissions")
    if (saved) setCompleted(JSON.parse(saved))

    const savedXp = localStorage.getItem("xp")
    if (savedXp) setXp(Number(savedXp))
  }, [])

  const t = translations[lang]

  const completeMission = async (missionId: string) => {
    const wallet = localStorage.getItem("wallet") || "demo-user"

    const res = await fetch("/api/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ missionId, wallet })
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

  return (
    <div style={{ padding: 24 }}>
      <h2>{t.missions}</h2>

      <div style={{ marginBottom: 20 }}>
        <strong>{t.xp}: {xp}</strong>
      </div>

      {xp >= 50 && (
        <div style={{ marginBottom: 20, padding: 12, border: "1px solid gold" }}>
          🏆 {t.badgeUnlocked}: Genesis Explorer
        </div>
      )}

      {missions.map(m => {
        const isDone = completed.includes(m.id)

        return (
          <div key={m.id} style={{ border: "1px solid #333", padding: 12, marginBottom: 12 }}>
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
