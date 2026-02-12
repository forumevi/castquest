import { NextResponse } from "next/server"

const badges: Record<string, any> = {
  "1": {
    name: "Genesis Explorer",
    description: "Awarded for completing your first missions on CastQuest.",
    image: "https://castquest.vercel.app/badges/genesis-explorer.png",
    attributes: [
      { trait_type: "Tier", value: "Genesis" },
      { trait_type: "Type", value: "Explorer" }
    ]
  },
  "2": {
    name: "Dungeon Scout",
    description: "Completed your first dungeon quest.",
    image: "https://castquest.vercel.app/badges/dungeon-scout.png",
    attributes: [
      { trait_type: "Tier", value: "Bronze" },
      { trait_type: "Type", value: "Scout" }
    ]
  },
  "3": {
    name: "Lore Seeker",
    description: "Discovered hidden lore within CastQuest.",
    image: "https://castquest.vercel.app/badges/lore-seeker.png",
    attributes: [
      { trait_type: "Tier", value: "Silver" },
      { trait_type: "Type", value: "Scholar" }
    ]
  }
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const badge = badges[params.id]

  if (!badge) {
    return NextResponse.json({ error: "Badge not found" }, { status: 404 })
  }

  return NextResponse.json(badge)
}
