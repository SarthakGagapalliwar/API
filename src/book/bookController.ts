import { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import bookModel from "./bookModel";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, genre } = req.body;
    const files = req.files as { [filename: string]: Express.Multer.File[] };

    if (!files || !files.coverImage || !files.coverImage[0]) {
      return res.status(400).json({ error: "coverImage file is required" });
    }

    const fs = await import("fs/promises");

    // --- Upload cover image ---
    const coverImageFile = files.coverImage[0];
    const coverImageMimeType = coverImageFile.mimetype.split("/").pop();
    const coverImagePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      coverImageFile.filename
    );

    try {
      await fs.access(coverImagePath);
    } catch {
      return res
        .status(400)
        .json({ error: `File not found at ${coverImagePath}` });
    }

    let coverUploadResult;
    try {
      coverUploadResult = await cloudinary.uploader.upload(coverImagePath, {
        folder: "book-covers",
        filename_override: coverImageFile.filename,
        format: coverImageMimeType,
      });
    } catch (cloudErr) {
      console.error("Cloudinary cover upload error:", cloudErr);
      return res
        .status(500)
        .json({ error: "Cover image upload failed", details: cloudErr });
    }

    // --- Upload book file (if present) ---
    let bookFileUploadResult: any = null;

    if (files.file && files.file[0]) {
      const bookFile = files.file[0];
      const bookFilePath = path.resolve(
        __dirname,
        "../../public/data/uploads",
        bookFile.filename
      );

      try {
        await fs.access(bookFilePath);
        bookFileUploadResult = await cloudinary.uploader.upload(bookFilePath, {
          resource_type: "raw",
          folder: "book-pdfs",
          filename_override: bookFile.filename,
        });
      } catch (err) {
        console.error("Book file upload error:", err);
      }

      // Delete book file after upload
      try {
        await fs.unlink(bookFilePath);
      } catch (err) {
        console.warn("Error deleting temp book file:", err);
      }
    }

    // --- Create book entry in DB ---
    if (!title || !genre) {
      return res
        .status(400)
        .json({ error: "title, genre, and author are required" });
    }

    const newBook = await bookModel.create({
      title,
      genre,
      author:"68e4efb6a9eebe6283324cfd",
      coverImage: coverUploadResult.secure_url,
      file: bookFileUploadResult ? bookFileUploadResult.secure_url : null,
    });

    // Delete cover image temp file
    try {
      await fs.unlink(coverImagePath);
    } catch (err) {
      console.warn("Error deleting temp cover image:", err);
    }

    res.status(201).json({
      message: "Book uploaded successfully",
      book: newBook,
    });
  } catch (error) {
    console.error("Book upload error:", error);
    next(error);
  }
};

export { createBook };
