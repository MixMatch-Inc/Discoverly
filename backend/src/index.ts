import { createServer } from "node:http"
import { createApp } from "./app.js"
import { connectDatabase } from "./config/database.js"
import { env } from "./config/env.js"

async function bootstrap() {
  await connectDatabase()
  const app = createApp()
  const server = createServer(app)

  server.listen(env.PORT, () => {
    console.log(`[backend] listening on port ${env.PORT}`)
  })
}

bootstrap().catch((error) => {
  console.error("[backend] failed to start", error)
  process.exit(1)
})
