"use client"
import { useEffect, useState } from "react"
import { WagmiConfig, useAccount } from "wagmi"
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

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => chooseLang("en")}>🇬🇧 English</button>
        <button onClick={() => chooseLang("tr")} style={{ marginLeft: 10 }}>🇹🇷 Türkçe</button>
      </div>

      <h1>🧭 {t.title}</h1>
      <p>{t.subtitle}</p>

      {isConnected ? (
        <p>Connected: {address}</p>
      ) : (
        <p>Wallet not connected</p>
      )}

      <a href="/missions">{t.missions} →</a>
    </div>
  )
}
