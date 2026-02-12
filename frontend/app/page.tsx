"use client"

import { useEffect, useState } from "react"
import { WagmiConfig, useAccount, useConnect, useDisconnect } from "wagmi"
import { InjectedConnector } from "wagmi/connectors/injected"
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
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  })
  const { disconnect } = useDisconnect()

  const [lang, setLang] = useState<Lang>("en")

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang
    if (saved) setLang(saved)
  }, [])

  const t = translations[lang]

  return (
    <div style={{ padding: 24 }}>

      <h1>🧭 {t.title}</h1>

      {!isConnected ? (
        <button onClick={() => connect()}>
          Connect MetaMask
        </button>
      ) : (
        <>
          <p>Connected: {address}</p>
          <button onClick={() => disconnect()}>
            Disconnect
          </button>
        </>
      )}
    </div>
  )
}
