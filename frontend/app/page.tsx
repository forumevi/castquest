"use client"
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

  return (
    <div style={{ padding: 24 }}>
      <h1>🧭 CastQuest</h1>
      <p>Complete missions. Earn onchain proof.</p>

      {isConnected ? (
        <p>Connected: {address}</p>
      ) : (
        <p>Please connect your wallet</p>
      )}

      <a href="/missions">Go to Missions →</a>
    </div>
  )
}
