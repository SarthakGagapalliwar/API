import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { verify, JwtPayload } from "jsonwebtoken";
import { config } from "../config/config";

export interface AuthRequest extends Request {
  userId: string;
}

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization");

  if (!token) {
    return next(createHttpError(401, "Authorization token is required."));
  }

  const parsedToken = token.split(" ")[1];
  if (!parsedToken) {
    return next(createHttpError(401, "Invalid authorization format."));
  }

  try {
    const decoded = verify(parsedToken, config.jwtSecret as string) as JwtPayload;

    if (!decoded || !decoded.sub) {
      return next(createHttpError(401, "Invalid token payload."));
    }

    (req as AuthRequest).userId = decoded.sub as string;
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return next(createHttpError(401, "Token has expired."));
    }
    return next(createHttpError(401, "Invalid or malformed token."));
  }
};

export default authenticate;
