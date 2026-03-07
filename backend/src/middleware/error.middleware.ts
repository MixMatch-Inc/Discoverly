import type { NextFunction, Request, Response } from "express"

export function errorHandler(err: unknown, _req: Request, res: Response, next: NextFunction): void {
  void next
  const message = err instanceof Error ? err.message : "Internal Server Error"
  res.status(500).json({
    error: "Internal Server Error",
    message,
  })
}
