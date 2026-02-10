import { NextResponse } from "next/server"

// Badge verilerini bir yerde topluyoruz
const badgesData = [
  {
    id: "1",
    name: "Genesis Explorer",
    description: "Awarded for completing your first missions on CastQuest.",
    image: "https://castquest.vercel.app/badges/genesis-explorer.png",
    attributes: [
      { trait_type: "Tier", value: "Genesis" },
      { trait_type: "Type", value: "Explorer" }
    ]
  },
  {
    id: "2",
    name: "Master Explorer",
    description: "Awarded for completing 10 missions on CastQuest.",
    image: "https://castquest.vercel.app/badges/master-explorer.png",
    attributes: [
      { trait_type: "Tier", value: "Master" },
      { trait_type: "Type", value: "Explorer" }
    ]
  },
  {
    id: "3",
    name: "Legendary Explorer",
    description: "Awarded for completing all missions on CastQuest.",
    image: "https://castquest.vercel.app/badges/legendary-explorer.png",
    attributes: [
      { trait_type: "Tier", value: "Legendary" },
      { trait_type: "Type", value: "Explorer" }
    ]
  }
]

// ID ile badge’i bulma fonksiyonu
function getBadgeById(id: string) {
  return badgesData.find((badge) => badge.id === id)
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const badge = getBadgeById(params.id)

  if (!badge) {
    return NextResponse.json({ error: "Badge not found" }, { status: 404 })
  }

  return NextResponse.json(badge)
}
