import {Request,Response, NextFunction } from 'express'
import jwt=require('jsonwebtoken')
const JWT_SECRET="piyush12345"

export function authMiddleware(req:Request,res:Response,next:NextFunction){
    const header=req.headers["authorization"]
    const decoded=jwt.verify(header as string,JWT_SECRET)
    if(decoded)
    {
         //@ts-ignore   
        req.userId=decoded.id;
        next();
    }else{
        res.json({
            msg:"error in connection"
        })
    }
 
}