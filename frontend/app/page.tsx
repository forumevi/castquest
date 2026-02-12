"use client"

import Link from "next/link"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { translations, Lang } from "../lib/i18n"
import { useEffect, useState } from "react"

export default function Home() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  const [lang, setLang] = useState<Lang>("en")

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang
    if (saved) setLang(saved)
  }, [])

  const t = translations[lang]

  const chooseLang = (l: Lang) => {
    localStorage.setItem("lang", l)
    setLang(l)
  }

  return (
    <div style={{ padding: 32, background: "black", color: "white", minHeight: "100vh" }}>
      
      {/* Language */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => chooseLang("en")}>GB English</button>
        <button onClick={() => chooseLang("tr")} style={{ marginLeft: 10 }}>
          TR Türkçe
        </button>
      </div>

      {/* Title */}
      <h1 style={{ fontSize: 42 }}>🧭 CastQuest</h1>
      <p style={{ marginTop: 10 }}>
        {t.subtitle}
      </p>

      {/* Wallet Section */}
      <div style={{ marginTop: 20 }}>
        {!isConnected ? (
          <>
            <p>Wallet not connected</p>
            <button
              onClick={() => connect({ connector: connectors[0] })}
              style={{ marginTop: 10 }}
            >
              Connect Wallet
            </button>
          </>
        ) : (
          <>
            <p>
              Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
            <button onClick={() => disconnect()} style={{ marginTop: 10 }}>
              Disconnect
            </button>
          </>
        )}
      </div>

      {/* Missions Link */}
      <div style={{ marginTop: 30 }}>
        <Link href="/missions" style={{ color: "#8a2be2", fontSize: 18 }}>
          {t.missions} →
        </Link>
      </div>

    </div>
  )
}
