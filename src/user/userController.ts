import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("Received body:", req.body);

    const { name, email, password } = req.body;

    // Simple validation
    if (!name || !email || !password) {
      const error = createHttpError(400, "All fields are required");
      return next(error);
    }

    // Process (e.g., save to DB here)

    // Response
    return res.status(201).json({
      message: "User created successfully",
      user: { name, email },
    });
  } catch (error) {
    next(error);
  }
};

export { createUser };
