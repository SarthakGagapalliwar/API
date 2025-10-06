import express from 'express'

const app= express();

//Routes
//https.methods GET,POST,PUT,PATCH,DELETE
app.get('/',(req,res,next)=>{
    res.json({message:"Welcome to elib apis"})
})


export default app;
