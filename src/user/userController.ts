import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import userModel from "./userModel";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(createHttpError(400, "All fields are required"));
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return next(createHttpError(400, "User already exists with this email"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    const jwtSecret = config.jwtSecret;
    if (!jwtSecret) {
      return next(createHttpError(500, "JWT secret is not configured"));
    }

    const token = sign({ sub: newUser._id }, jwtSecret, {
      expiresIn: "7d",
    });

    return res.status(201).json({
      message: "User created successfully",
      accessToken: token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const loginUser =async(req:Request,res:Response,next:NextFunction)=>{
   try{
    const {email,password} =req.body;

    if(!email || !password){
        return next(createHttpError(400,"All field are required"));
    }

    const user = await userModel.findOne({email});

    if(!user){
        return next(createHttpError(404,"user not found."));
    }

    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
        return next(createHttpError(400,"Username or passwod incorrect!"))
    }

    //creta acreestoekn

    const token = sign({sign:user._id},config.jwtSecret as string,{
        expiresIn:"7d",
    })

    res.json({eccessToekn:token});

   }catch(err){
    next(err)
   } 
}

export { createUser,loginUser };
