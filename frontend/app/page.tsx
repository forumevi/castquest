"use client"
import { useEffect } from "react"
import { useAccount, WagmiConfig } from "wagmi"
import { config } from "../lib/wallet"

export default function Home() {
  return (
    <WagmiConfig config={config}>
      <Main />
    </WagmiConfig>
  )
}

function Main() {
  const { address, isConnected } = useAccount()

  // Wallet bağlanınca localStorage'a kaydet
  useEffect(() => {
    if (isConnected && address) {
      localStorage.setItem("wallet", address)
    }
  }, [isConnected, address])

  return (
    <div style={{ padding: 24 }}>
      <h1>🧭 CastQuest</h1>
      <p>Complete missions. Earn onchain proof.</p>

      {isConnected ? (
        <p>Connected: {address}</p>
      ) : (
        <p>Please connect your wallet using your browser wallet</p>
      )}

      <a href="/missions">Go to Missions →</a>
    </div>
  )
}
