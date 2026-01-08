import express from "express";
import fetch from "node-fetch";

const app = express();

app.use(express.json());
app.use(express.static("public"));

// 🔊 ElevenLabs
async function textToSpeech(text) {
  const response = await fetch(
    "https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.7
        }
      })
    }
  );

  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

app.post("/api", async (req, res) => {
  const { text, verified, user } = req.body;

  // 🔐 Verificación
  if (!verified) {
    if (text === "1010") {
      return res.json({
        reply: "Clave correcta. Presiona 1 si eres Soledad o 2 si eres Facundo.",
        verified: false,
        user: null
      });
    }

    if (text === "1") {
      return res.json({
        reply: "Hola Soledad. ¿Qué necesitas hoy?",
        verified: true,
        user: "Soledad"
      });
    }

    if (text === "2") {
      return res.json({
        reply: "Hola Facundo. ¿Qué necesitas hoy?",
        verified: true,
        user: "Facundo"
      });
    }

    return res.json({
      reply: "Clave incorrecta.",
      verified: false,
      user: null
    });
  }

  // 🤖 Gemini
  const r = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
      process.env.GEMINI_API_KEY,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Eres BEKA AI, un asistente tipo calendario.
Usuario (${user}) dice: ${text}`
              }
            ]
          }
        ]
      })
    }
  );

  const j = await r.json();
  const reply =
    j.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Ocurrió un error.";

  const audio = await textToSpeech(reply);

  res.json({
    reply,
    audio,
    verified: true,
    user
  });
});

app.listen(3000, () => {
  console.log("BEKA AI en http://localhost:3000");
});
