import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(process.cwd(), "frontend")));

app.get("/", (req, res) => {
  res.json({
    message: "EduPata backend is running",
    status: "ok"
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok"
  });
});

app.post("/api/register", (req, res) => {
  res.status(200).json({
    message: "Registration endpoint is working",
    data: req.body
  });
});

app.post("/api/payments/stkpush", (req, res) => {
  res.status(200).json({
    message: "STK Push endpoint is ready for Daraja configuration"
  });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`EduPata server running on port ${PORT}`);
});
