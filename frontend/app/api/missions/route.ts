import missions from "../../../../backend/src/data/missions.json"

export async function GET() {
  return Response.json(missions)
}
