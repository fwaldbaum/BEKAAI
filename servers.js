import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());
app.use(express.static("."));

app.post("/api", async (req, res) => {
  const { text, verified, user } = req.body;

  if (!verified) {
    if (text === "1010") {
      return res.json({
        reply: "Clave correcta. Escribe 1 para Soledad o 2 para Facundo",
        verified: false,
        user: null
      });
    }
    if (text === "1") {
      return res.json({ reply: "Hola Soledad", verified: true, user: "Soledad" });
    }
    if (text === "2") {
      return res.json({ reply: "Hola Facundo", verified: true, user: "Facundo" });
    }
    return res.json({ reply: "Clave incorrecta", verified: false, user: null });
  }

  const r = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
      process.env.GEMINI_API_KEY,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: text }] }]
      })
    }
  );

  const j = await r.json();
  const reply = j.candidates?.[0]?.content?.parts?.[0]?.text || "Error";

  res.json({ reply, verified: true, user });
});

app.listen(3000);
