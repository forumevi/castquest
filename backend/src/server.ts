import express from "express"
import cors from "cors"
import missions from "./data/missions.json"

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (_, res) => {
  res.send("CastQuest API is running 🚀")
})

app.get("/missions", (_, res) => {
  res.json(missions)
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
