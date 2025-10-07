import { Request, Response, NextFunction } from "express";

const creteUser = async (req: Request, res: Response, next: NextFunction) => {

    res.json({message: "User created"});

};


export {creteUser};