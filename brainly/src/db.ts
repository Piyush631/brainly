import mongoose=require('mongoose')
const Schema=mongoose.Schema

const user=new Schema({
    username:{type:String,required:true,unique:true},
    password:{type:String,required:true}
})

const content=new Schema({
link:{type:String,required:true},
type:{type:String,required:true},
title:{type:String},
tag:[{tpye:String}],
userId:{type:mongoose.Schema.Types.ObjectId,ref:'users'}

})
const tag=new Schema({
    title:{type:String,unique:true,required:true}
})
const link=new Schema({
    hash:{type:String,required:true},
    userId:{type:mongoose.Schema.Types.ObjectId,ref:'users', required:true}
})

 export const userModel=mongoose.model("users",user)
 export const contentModel=mongoose.model("contents",content)
 export const tagModel=mongoose.model("tags",tag);
 export const linkModel=mongoose.model("links",link)

