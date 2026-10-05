import express from "express";
import cors from "cors";
import { pool } from "./db.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "UP", database: "CONNECTED" });
  } catch {
    res.status(503).json({ status: "DOWN", database: "UNAVAILABLE" });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const { search = "", category = "" } = req.query;
    const result = await pool.query(
      `SELECT * FROM products
       WHERE ($1 = '' OR name ILIKE '%' || $1 || '%' OR description ILIKE '%' || $1 || '%')
       AND ($2 = '' OR category = $2)
       ORDER BY id`,
      [search, category]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Unable to load products", error: error.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: "Product not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Unable to load product", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`VAM Books backend running on port ${PORT}`);
});
