import express =require('express')
import mongoose=require('mongoose')
import jwt=require('jsonwebtoken')
import { z } from "zod";

import { contentModel, linkModel, userModel } from './db';
import  bcrypt = require('bcrypt');
import {Request,Response } from 'express'
import { authMiddleware } from './authMiddleware';
import { random } from './utils';
import cors from 'cors'
const JWT_SECRET="piyush12345"
const app=express();
app.use(express.json())
app.use(cors())
app.post("/api/v1/signup",async (req,res)=>{
    
    const{username,password}=req.body;
    //create a zod validation
    const userValidation= z.object({
        username:z.string().min(3).max(30),
        password:z.string().min(5,{message:"password is too short"}).max(20)
    })
    const parseData=userValidation.safeParse(req.body);
    if(!parseData.success){
         res.status(400).json({
            msg:parseData.error
        })
        return 
    }
else{


 //hasing a password
 const hashedPassword=await bcrypt.hash(password,5)
 //storing a data  in a database 
 try{
         await userModel.create({
             username:username,
             password:hashedPassword
         })
     res.json({
             msg:"user is successfully signup"
         })
         return  
 }catch(err)
 {
      res.status(402).json(
         {
             msg:"user is already exist"
         }
     )
     return
 }
    
}
    

})                          
app.post("/api/v1/signin",async (req:Request,res:Response)=>{
    const {username,password}=req.body
    const userValidation=z.object({
        username:z.string().min(3).max(30),
        password:z.string().min(5).max(30)
    })
const parseData=userValidation.safeParse(req.body)

if(!parseData.success)
{
   
 res.json({
        msg:parseData.error
    });
    return ;
}
try { 
    const  response:any=await userModel.findOne({
        username:username
    })

    if(!response.username){
        res.status(400).json({
            msg:"user doest not exist"
        });
        return ;
    }                                                 
    const  passwordmatch=await bcrypt.compare(password,response.password) 
    if(!passwordmatch){
        res.json({
            msg:"password does not match"
   
        })
    return ;
    }

    if(response && passwordmatch)
    {
        const token=jwt.sign({
            id:response._id
        },JWT_SECRET)
        res.json({
            token:token
        })
        return ;
        
    }
}catch(error){
    res.json({
        msg:"invalid details"
    })
  
}


})

app.post("/api/v1/content",authMiddleware,async (req,res)=>{

    const {link,type,title,tag}=req.body
    try{
        await contentModel.create ({
            link:link,
            type:type,
            title:title,
            tag:tag,
             //@ts-ignore
            userId:req.userId


        })
        res.json({
            msg:"Content added successfully"
        })
    }catch(error){
        res.json({
            error
        })
    }

})
app.get("/api/v1/content",authMiddleware,async(req,res)=>{

    try{
      const  data=  await contentModel.find({
            //@ts-ignore
            userId:req.userId

        }).populate("userId","username")
        res.json({
            data
        })
    } catch(e){
        res.json({
            msg:"content not found"
        })
    }


  
})
app.delete("/api/v1/content",authMiddleware,async(req,res)=>{
    const  {id}=req.body
    try{
        await contentModel.deleteOne({
                //@ts-ignore
            userId:req.userId,
            _id:id
        })
        res.json({
                msg:"content delete successfully"
    
        })
    }catch(e){
        res.json({
            msg:"content is not found"
        })
    }

})
app.post("/api/v1/brain/sharelink",authMiddleware,async(req,res)=>{
    const share=req.body.share
    if(share)
    {
        const existingLink=await linkModel.findOne({
            //@ts-ignore
            userId:req.userId
        })
        if(existingLink){
            res.json({
                msg:"Link is already created"
            })
            return
        }
        const hash=random(10)
            await linkModel.create({
                hash:hash,
                //@ts-ignore
                userId:req.userId
            })
            res.json({
                msg:hash
            })
        
    }else{
        await linkModel.deleteOne({
            //@ts-ignore
            userId:req.userID
        })
        res.json({
            message:"Link is removed"
        })

    }

})

app.get("/api/v1/brain/:sharelink",async(req,res)=>{
    const hash=req.params.sharelink

        const link=await linkModel.findOne({
            hash
        })
    if(!link)
    {
        res.json({
            msg:"link is not found"
        })
        return;
    }
    const content=await contentModel.find({
        userId:link.userId
    })
    const user=await userModel.findOne({
        _id:link.userId
    })
    if(!user){
        res.json({
            msg:"user is not found"
        })
        return
    }
    res.json({
        user:user.username,
        content
    })
    
})



async  function main (){
    mongoose.connect('mongodb+srv://admin:Kangra%40123@cluster0.9j1kk.mongodb.net/brainly-app')
    app.listen(3000)
    console.log("you are connected to database")
}
   main();




   