import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL
    ? { rejectUnauthorized: false }
    : false
});

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      phone VARCHAR(30) NOT NULL UNIQUE,
      email VARCHAR(150),
      level VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

app.get("/", (req, res) => {
  res.json({
    service: "EduPata backend",
    status: "online"
  });
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, database: "connected" });
  } catch (error) {
    res.status(500).json({ ok: false, database: "disconnected" });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const { name, phone, email, level } = req.body || {};

    if (!name || !phone || !level) {
      return res.status(400).json({
        error: "Name, phone and education level are required."
      });
    }

    const result = await pool.query(
      `INSERT INTO students (name, phone, email, level)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, phone, email, level, created_at`,
      [name, phone, email || null, level]
    );

    res.status(201).json({
      message: "Student registered successfully.",
      student: result.rows[0]
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "A student with this phone number is already registered."
      });
    }

    console.error(error);
    res.status(500).json({
      error: "Unable to register student."
    });
  }
});

app.post("/api/payments/stkpush", (req, res) => {
  res.status(501).json({
    error: "M-Pesa is not connected yet."
  });
});

const port = process.env.PORT || 10000;

initDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`EduPata backend listening on ${port}`);
    });
  })
  .catch((error) => {
    console.error("Database initialization failed:", error);
    process.exit(1);
  });
