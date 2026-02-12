"use client"

import "@rainbow-me/rainbowkit/styles.css"
import { ReactNode } from "react"

import { WagmiConfig, configureChains, createConfig } from "wagmi"
import { base } from "wagmi/chains"
import { publicProvider } from "wagmi/providers/public"

import {
  RainbowKitProvider,
  getDefaultWallets
} from "@rainbow-me/rainbowkit"

const { chains, publicClient } = configureChains(
  [base],
  [publicProvider()]
)

const { connectors } = getDefaultWallets({
  appName: "CastQuest",
  projectId: "BURAYA_WALLETCONNECT_PROJECT_ID_YAPIŞTIR",
  chains
})

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})

export default function RootLayout({ children }: { children: ReactNode }) {
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
