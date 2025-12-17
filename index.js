const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors());

// Multer für Datei-Uploads
const upload = multer({ storage: multer.memoryStorage() });

// SMTP Transporter (Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// Upload-Route
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Keine Datei erhalten" });
    }

    await transporter.sendMail({
      from: `"Kalorien Tracker" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: "Anonymes Nahrungsprotokoll",
      text: "Eine Datei wurde anonym hochgeladen.",
      attachments: [
        {
          filename: req.file.originalname,
          content: req.file.buffer
        }
      ]
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Fehler beim Senden:", err);
    res.status(500).json({ error: "Fehler beim Senden" });
  }
});

app.listen(3000, () => console.log("Server läuft auf Port 3000"));