import { Router } from "express"
import multer from "multer"
import { uploadImageToS3 } from "../services/upload.service.js"

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
})

export const uploadRouter = Router()

uploadRouter.post("/", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({
        error: "Bad Request",
        message: "Missing image file in form-data field 'file'",
      })
      return
    }

    const { url } = await uploadImageToS3(req.file)

    res.status(201).json({
      ok: true,
      url,
    })
  } catch (error) {
    next(error)
  }
})
