"use client"

import { useEffect, useState } from "react"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { translations, Lang } from "../lib/i18n"

export default function Home() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  const [lang, setLang] = useState<Lang>("en")
  const [mintedBadge, setMintedBadge] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang
    if (saved) setLang(saved)
  }, [])

  const t = translations[lang]

  const chooseLang = (l: Lang) => {
    localStorage.setItem("lang", l)
    setLang(l)
  }

  const mintBadge = async () => {
    if (!address) return

    try {
      setLoading(true)

      const res = await fetch("/api/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: address,
          badgeSlug: "genesis-explorer", // ✅ FIX BURADA
        }),
      })

      const data = await res.json()

      if (data.success) {
        const metaRes = await fetch(`/api/badges/genesis-explorer`)
        const metadata = await metaRes.json()
        setMintedBadge(metadata)
      } else {
        console.error(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>🧭 CastQuest</h1>

        {!isConnected ? (
          <button onClick={() => connect({ connector: connectors[0] })}>
            Connect Wallet
          </button>
        ) : (
          <div>
            <span style={{ marginRight: 10 }}>
              {address?.slice(0,6)}...{address?.slice(-4)}
            </span>
            <button onClick={() => disconnect()}>
              Disconnect
            </button>
          </div>
        )}
      </div>

      {/* Language */}
      <div style={{ marginTop: 20 }}>
        <button onClick={() => chooseLang("en")}>🇬🇧 English</button>
        <button onClick={() => chooseLang("tr")} style={{ marginLeft: 10 }}>
          🇹🇷 Türkçe
        </button>
      </div>

      <h2 style={{ marginTop: 30 }}>{t.title}</h2>
      <p>{t.subtitle}</p>

      {/* Mint */}
      {isConnected && (
        <button
          onClick={mintBadge}
          disabled={loading}
          style={{
            marginTop: 20,
            padding: 12,
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          {loading ? "Minting..." : "Mint Genesis Badge"}
        </button>
      )}

      {/* NFT Preview */}
      {mintedBadge && (
        <div
          style={{
            marginTop: 30,
            padding: 20,
            border: "1px solid #ccc",
            borderRadius: 12,
            maxWidth: 320,
          }}
        >
          <img
            src={mintedBadge.image}
            alt={mintedBadge.name}
            style={{ width: "100%", borderRadius: 8 }}
          />
          <h3>{mintedBadge.name}</h3>
          <p>{mintedBadge.description}</p>
        </div>
      )}
    </div>
  )
}
