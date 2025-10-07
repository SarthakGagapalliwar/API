import { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import bookModel from "./bookModel";
import createHttpError from "http-errors";
import { AuthRequest } from "../middleware/authenticate";

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

    // Use userId from authenticate middleware if present
    // (req as any).userId is set by authenticate.ts
    const userId = (req as any).userId;
    // console.log("userId", userId);

    const newBook = await bookModel.create({
      title,
      genre,
      author: userId,
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

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, genre } = req.body;
    const bookId = req.params.bookId;
    const book = await bookModel.findOne({ _id: bookId });
    if (!book) {
      return next(createHttpError(404, "Book not found"));
    }
    // check access
    const _req = req as AuthRequest;
    if (book.author.toString() !== _req.userId) {
      return next(createHttpError(403, "you can not update others book"));
    }

    const fs = await import("fs/promises");
    // check if image field exists
    let updatedCoverImage = book.coverImage;
    if (req.files && (req.files as any).coverImage) {
      const coverImageFile = (req.files as any).coverImage[0];
      const filePath = path.resolve(
        __dirname,
        "../../public/data/uploads",
        coverImageFile.filename
      );
      const coverImageMimeType = coverImageFile.mimetype.split("/").pop()|| "png"; // if we ar not not uploding png
      try {
        await fs.access(filePath);
        const uploadResult = await cloudinary.uploader.upload(filePath, {
          filename_override: coverImageFile.filename,
          folder: "book-covers",
          format: coverImageMimeType,
        });
        updatedCoverImage = uploadResult.secure_url;
        await fs.unlink(filePath);
      } catch (err) {
        console.warn("Error updating cover image:", err);
      }
    }

    // same for pdf
    let updatedFile = book.file;
    if (req.files && (req.files as any).file) {
      const bookFile = (req.files as any).file[0];
      const filePath = path.resolve(
        __dirname,
        "../../public/data/uploads",
        bookFile.filename
      );
      try {
        await fs.access(filePath);
        const uploadResult = await cloudinary.uploader.upload(filePath, {
          resource_type: "raw",
          filename_override: bookFile.filename,
          folder: "book-pdfs",
          format: "pdf",
        });
        updatedFile = uploadResult.secure_url;
        await fs.unlink(filePath);
      } catch (err) {
        console.warn("Error updating book file:", err);
      }
    }

    const updatedBook = await bookModel.findByIdAndUpdate(
      bookId,
      {
        title: title || book.title,
        genre: genre || book.genre,
        coverImage: updatedCoverImage,
        file: updatedFile,
      },
      { new: true }
    );
    res.json(updatedBook);
  } catch (error) {
    next(error);
  }
};



const listBooks = async (req: Request, res: Response, next: NextFunction)=>{
  try{
    //todo :add pagination.
    const book = await bookModel.find();

    res.json(book);
  }catch(err){
    return next(createHttpError(500,"Error while getting a book"))
    console.error(err);
  }
  
}



const getSingleBook =async (req: Request, res: Response, next: NextFunction)=>{
    const bookId=req.params.bookId;

    try{
        const book = await bookModel.findOne({_id:bookId});

        if(!book){
          return next(createHttpError(404, "Book not found."))
        }
        return res.json(book);

    }catch(err){
      return next(createHttpError(500,"Error while getting a book"));
      console.error(err);
    }
}

export { createBook, updateBook,listBooks,getSingleBook};
