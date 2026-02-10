import { NextResponse } from "next/server"

// Badge verilerini buraya ekliyoruz
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

// GET metodu
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  // params.id alımı için güvenli kontrol
  const id = params?.id
  if (!id) {
    return NextResponse.json({ error: "Badge ID missing" }, { status: 400 })
  }

  const badge = badges[id]

  if (!badge) {
    return NextResponse.json({ error: "Badge not found" }, { status: 404 })
  }

  return NextResponse.json(badge)
}
