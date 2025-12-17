import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import SibApiV3Sdk from "sib-api-v3-sdk";

const app = express();
const upload = multer({ dest: "uploads/" });

// Brevo API konfigurieren
SibApiV3Sdk.ApiClient.instance.authentications["api-key"].apiKey =
  process.env.BREVO_API_KEY;

// Datei-Upload + Mailversand
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileData = fs.readFileSync(filePath).toString("base64");

    const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

    await emailApi.sendTransacEmail({
      sender: { email: process.env.BREVO_SENDER },
      to: [{ email: process.env.BREVO_RECEIVER }],
      subject: "Neue Datei vom Kalorien-Tracker",
      htmlContent: "<p>Eine Datei wurde hochgeladen.</p>",
      attachment: [
        {
          name: fileName,
          content: fileData
        }
      ]
    });

    fs.unlinkSync(filePath);

    res.json({ success: true });
  } catch (err) {
    console.error("Fehler beim Senden:", err);
    res.status(500).json({ error: "Fehler beim Senden" });
  }
});

app.listen(3000, () => console.log("Server läuft"));