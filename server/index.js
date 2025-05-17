import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import csv from "csv-parser";
import axios from "axios";

dotenv.config();
const app = express();
const port = 5000;
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

const HF_API_KEY = process.env.HF_API_KEY;
const HF_MODEL = "philschmid/bart-large-cnn-samsum";

function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

async function summarizeWithHuggingFace(inputText) {
  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      { inputs: inputText },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    const result = response.data;
    if (Array.isArray(result) && result[0]?.summary_text) {
      return result[0].summary_text;
    } else {
      throw new Error("Unexpected response from Hugging Face");
    }
  } catch (err) {
    console.error("❌ HF Summarization Error:", err.response?.data || err.message);
    throw new Error("Summarization failed");
  }
}

// Route to check backend is live
app.get("/", (req, res) => {
  res.send("Business Report AI Backend is running.");
});

// CSV Upload and Summary
app.post("/upload", upload.single("file"), async (req, res) => {
  const filePath = req.file.path;
  try {
    const parsedData = await parseCSV(filePath);
    const summary = await summarizeWithHuggingFace(
      `Summarize this business data:\n${JSON.stringify(parsedData, null, 2)}`
    );
    res.json({ data: parsedData, summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    fs.unlink(filePath, () => {});
  }
});

// Summarize plain text
app.post("/summarize-text", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Missing 'text' in request body" });
  }

  try {
    const summary = await summarizeWithHuggingFace(text);
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
