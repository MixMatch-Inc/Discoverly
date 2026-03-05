import type { NextFunction, Request, RequestHandler, Response } from "express"
import { ZodError, type AnyZodObject } from "zod"

type RequestSchema = {
  body?: AnyZodObject
  query?: AnyZodObject
  params?: AnyZodObject
}

export function validateRequest(schema: RequestSchema): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body)
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query)
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params)
      }
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: "Bad Request",
          message: "Validation failed",
          details: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
            code: issue.code,
          })),
        })
        return
      }
      next(error)
    }
  }
}
