"use client"

import "@rainbow-me/rainbowkit/styles.css"

import { WagmiConfig } from "wagmi"
import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit"
import { configureChains, createConfig } from "wagmi"
import { base } from "wagmi/chains"
import { publicProvider } from "wagmi/providers/public"

const { chains, publicClient } = configureChains(
  [base],
  [publicProvider()]
)

const { connectors } = getDefaultWallets({
  appName: "CastQuest",
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID", // aşağıyı oku
  chains
})

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains}>
            {children}
          </RainbowKitProvider>
        </WagmiConfig>
      </body>
    </html>
  )
}
