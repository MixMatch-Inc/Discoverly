import type { NextFunction, Request, Response } from "express"
import multer from "multer"

export function errorHandler(err: unknown, _req: Request, res: Response, next: NextFunction): void {
  void next
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    res.status(400).json({
      error: "Bad Request",
      message: "File exceeds maximum size of 5MB",
    })
    return
  }
  const message = err instanceof Error ? err.message : "Internal Server Error"
  res.status(500).json({
    error: "Internal Server Error",
    message,
  })
}
