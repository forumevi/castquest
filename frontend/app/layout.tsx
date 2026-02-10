export const metadata = {
  title: "CastQuest",
  description: "Complete missions. Earn onchain proof."
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif", background: "#0f0f0f", color: "white" }}>
        {children}
      </body>
    </html>
  )
}
