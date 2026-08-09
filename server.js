import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app=express();
app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>res.json({service:"EduPata backend",status:"online"}));
app.get("/health",(req,res)=>res.json({ok:true}));

app.post("/api/register",(req,res)=>{
 const {name,phone,email,level}=req.body||{};
 if(!name||!phone||!level)return res.status(400).json({error:"Name, phone and education level are required."});
 res.status(201).json({message:"Registration endpoint is ready.",student:{name,phone,email:email||null,level}});
});

app.post("/api/payments/stkpush",(req,res)=>{
 res.status(501).json({error:"M-Pesa is not connected yet.",nextStep:"Configure Daraja securely in Render, then enable STK Push."});
});

const port=process.env.PORT||10000;
app.listen(port,()=>console.log(`EduPata backend listening on ${port}`));