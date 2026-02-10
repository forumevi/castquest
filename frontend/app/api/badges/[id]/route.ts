import { NextResponse } from "next/server"

const badges: Record<string, any> = {
  "genesis-explorer": {
    name: "Genesis Explorer",
    description: "Awarded for completing your first missions on CastQuest.",
    image: "https://castquest.vercel.app/badges/genesis-explorer.png",
    attributes: [
      { trait_type: "Tier", value: "Genesis" },
      { trait_type: "Type", value: "Explorer" }
    ]
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const badge = badges[params.id]

  if (!badge) {
    return NextResponse.json({ error: "Badge not found" }, { status: 404 })
  }

  return NextResponse.json(badge)
}
