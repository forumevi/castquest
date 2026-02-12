"use client"

import { useEffect, useState } from "react"
import { WagmiConfig, useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { config } from "../lib/wallet"
import { translations, Lang } from "../lib/i18n"

export default function Home() {
  return (
    <WagmiConfig config={config}>
      <Main />
    </WagmiConfig>
  )
}

function Main() {
  const { address, isConnected } = useAccount()

  const [lang, setLang] = useState<Lang>("en")
  const [mintedBadge, setMintedBadge] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang
    if (saved) setLang(saved)
  }, [])

  useEffect(() => {
    if (isConnected && address) {
      localStorage.setItem("wallet", address)
    }
  }, [isConnected, address])

  const t = translations[lang]

  const chooseLang = (l: Lang) => {
    localStorage.setItem("lang", l)
    setLang(l)
  }

  const mintBadge = async (badgeId: string) => {
    if (!address) return

    try {
      setLoading(true)

      const res = await fetch("/api/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: address,
          badgeId
        })
      })

      const data = await res.json()

      if (data.success) {
        const metaRes = await fetch(`/api/badges/${badgeId}`)
        const metadata = await metaRes.json()
        setMintedBadge(metadata)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24 }}>

      {/* Language Switch */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => chooseLang("en")}>🇬🇧 English</button>
        <button onClick={() => chooseLang("tr")} style={{ marginLeft: 10 }}>
          🇹🇷 Türkçe
        </button>
      </div>

      <h1>🧭 {t.title}</h1>
      <p>{t.subtitle}</p>

      {/* 🔌 WALLET CONNECT BUTTON */}
      <div style={{ marginBottom: 20 }}>
        <ConnectButton />
      </div>

      {isConnected ? (
        <>
          <p>Connected: {address}</p>

          <button
            onClick={() => mintBadge("genesis-explorer")}
            disabled={loading}
            style={{
              marginTop: 20,
              padding: 10,
              borderRadius: 8,
              cursor: "pointer"
            }}
          >
            {loading ? "Minting..." : "Mint Genesis Badge"}
          </button>
        </>
      ) : (
        <p>Wallet not connected</p>
      )}

      {/* NFT Preview */}
      {mintedBadge && (
        <div
          style={{
            marginTop: 30,
            padding: 20,
            border: "1px solid #333",
            borderRadius: 12,
            maxWidth: 320
          }}
        >
          <img
            src={mintedBadge.image}
            alt={mintedBadge.name}
            style={{ width: "100%", borderRadius: 8 }}
          />
          <h2>{mintedBadge.name}</h2>
          <p>{mintedBadge.description}</p>

          <ul>
            {mintedBadge.attributes.map((attr: any, i: number) => (
              <li key={i}>
                <strong>{attr.trait_type}:</strong> {attr.value}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: 40 }}>
        <a href="/missions">{t.missions} →</a>
      </div>
    </div>
  )
}
