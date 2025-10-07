import { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary";
// import createHttpError from "http-errors";
// import bookRouter from "./bookRouter";
import path from "node:path";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate file presence
    const files = req.files as { [filename: string]: Express.Multer.File[] };
    if (!files || !files.coverImage || !files.coverImage[0]) {
      return res.status(400).json({ error: "coverImage file is required" });
    }

    const mimeParts = files.coverImage[0].mimetype.split("/");
    const coverImageMimeType = mimeParts[mimeParts.length - 1];
    const fileName = files.coverImage[0].filename;
    const filePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      fileName
    );

    // Check if file exists before upload
    const fs = await import("fs/promises");
    try {
      await fs.access(filePath);
    } catch {
      return res.status(400).json({ error: `File not found at ${filePath}` });
    }

    // Cloudinary upload
    let uploadResult;
    try {
      uploadResult = await cloudinary.uploader.upload(filePath, {
        filename_override: fileName,
        folder: "book-covers",
        format: coverImageMimeType,
      });
    } catch (cloudErr) {
      console.error("Cloudinary upload error:", cloudErr);
      return res
        .status(500)
        .json({ error: "Cloudinary upload failed", details: cloudErr });
    }

    console.log("uploadResult", uploadResult);
    // --- Book file upload (PDF, etc.) ---
    if (files && files.file && files.file[0]) {
      const bookFileName = files.file[0].filename;
      const bookFilePath = path.resolve(
        __dirname,
        "../../public/data/uploads",
        bookFileName
      );

      try {
        await fs.access(bookFilePath);
        const bookFileUploadResult = await cloudinary.uploader.upload(
          bookFilePath,
          {
            resource_type: "raw",
            folder: "book-pdfs",
            filename_override: bookFileName,
          }
        );
        console.log("bookFileUploadResult", bookFileUploadResult);
        // You can add bookFileUploadResult.secure_url to your DB save logic here
      } catch (err) {
        console.error("Book file upload error:", err);
      }
    }

    res.json({ uploadResult });
  } catch (error) {
    console.error("Book upload error:", error);
    next(error);
  }
};

export { createBook };
