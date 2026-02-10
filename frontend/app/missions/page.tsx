"use client"
import { useEffect, useState } from "react"

export default function Missions() {
  const [missions, setMissions] = useState<any[]>([])
  const [completed, setCompleted] = useState<string[]>([])

  useEffect(() => {
    fetch("/api/missions")
      .then(res => res.json())
      .then(setMissions)

    const saved = localStorage.getItem("completedMissions")
    if (saved) setCompleted(JSON.parse(saved))
  }, [])

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
      alert("Mission completed! +" + data.xpEarned + " XP 🎉")
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Missions / Görevler</h2>

      {missions.map(m => {
        const isDone = completed.includes(m.id)

        return (
          <div
            key={m.id}
            style={{
              border: "1px solid #333",
              padding: 12,
              marginBottom: 12,
              opacity: isDone ? 0.6 : 1
            }}
          >
            <h3>{m.title_en} / {m.title_tr}</h3>
            <p>{m.description_en}</p>

            {isDone ? (
              <button disabled>✅ Completed</button>
            ) : (
              <button onClick={() => completeMission(m.id)}>
                Verify
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
