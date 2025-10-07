// src/routes/userRoutes.ts
import express from "express";
import { creteUser } from "./userController";

const userRouter = express.Router();

// Routes
userRouter.post("/register", creteUser);

export default userRouter;
