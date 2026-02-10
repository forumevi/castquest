"use client"
import { useEffect, useState } from "react"

export default function Missions() {
  const [missions, setMissions] = useState<any[]>([])

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_API_URL + "/missions")
      .then(res => res.json())
      .then(setMissions)
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <h2>Missions / Görevler</h2>

      {missions.map(m => (
        <div key={m.id} style={{ border: "1px solid #333", padding: 12, marginBottom: 12 }}>
          <h3>{m.title_en} / {m.title_tr}</h3>
          <p>{m.description_en}</p>
          <button>Verify</button>
        </div>
      ))}
    </div>
  )
}
