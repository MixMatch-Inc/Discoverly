import { Router } from "express"
import { z } from "zod"
import { validateRequest } from "../middleware/validate-request.middleware.js"

const pingBodySchema = z.object({
  message: z.string().min(1, "message is required"),
  timestamp: z.string().datetime().optional(),
})

export const pingRouter = Router()

pingRouter.post("/", validateRequest({ body: pingBodySchema }), (req, res) => {
  res.status(200).json({
    ok: true,
    echo: req.body.message,
  })
})
