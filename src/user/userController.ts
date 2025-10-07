import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcrypt"

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("Received body:", req.body);

    const { name, email, password } = req.body;

    // Simple validation
    if (!name || !email || !password) {
      const error = createHttpError(400, "All fields are required");
      return next(error);
    }

    //Database call
    const user=await userModel.findOne({
    //   email: email if key value are are same use simple
        email
    })
    if(user){
        const error=createHttpError(400,"User alreday exits with this email");
        return next(error);
    }
    //password=>hash

    const hashedPassword = await bcrypt.hash(password,10);

    const newUser =await userModel.create({
        name,
        email,
        password:hashedPassword,
    })
    // Process (e.g., save to DB here)

    res.json({id:newUser._id});

    //Token genration JWT
    

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
