import { Router } from "express"
import multer from "multer"
import { uploadImageToS3 } from "../services/upload.service.js"

const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
const INVALID_UPLOAD_TYPE_MESSAGE = "Unsupported file type. Allowed types: jpeg, png, webp."

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
      callback(null, true)
      return
    }
    callback(new Error(INVALID_UPLOAD_TYPE_MESSAGE))
  },
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
