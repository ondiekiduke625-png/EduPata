import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";
import path from "path";

dotenv.config();

const { Pool } = pg;

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(process.cwd(), "frontend")));

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL
    ? { rejectUnauthorized: false }
    : false
});

// Initialize database
async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(255),
      phone_number VARCHAR(30),
      email VARCHAR(255),
      education_level VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    ALTER TABLE students
      ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS phone_number VARCHAR(30),
      ADD COLUMN IF NOT EXISTS email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS education_level VARCHAR(100),
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  `);

  console.log("Database initialized successfully");
}

initializeDatabase().catch((error) => {
  console.error("Database initialization failed:", error);
});

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "frontend", "index.html"));
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok"
  });
});

// Student registration
app.post("/api/register", async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      email,
      educationLevel
    } = req.body;

    if (!fullName || !phoneNumber || !educationLevel) {
      return res.status(400).json({
        message: "Full name, phone number and education level are required."
      });
    }

    const result = await pool.query(
      `
      INSERT INTO students
        (full_name, phone_number, email, education_level)
      VALUES
        ($1, $2, $3, $4)
      RETURNING id, full_name, phone_number, email, education_level, created_at
      `,
      [fullName, phoneNumber, email || null, educationLevel]
    );

    res.status(201).json({
      message: "Registration successful! Welcome to EduPata.",
      student: result.rows[0]
    });

  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Registration failed. Please try again."
    });
  }
});

// M-Pesa placeholder
app.post("/api/payments/stkpush", (req, res) => {
  res.status(200).json({
    message: "STK Push endpoint is ready for Daraja configuration"
  });
});

// Start server
const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`EduPata server running on port ${PORT}`);
});
