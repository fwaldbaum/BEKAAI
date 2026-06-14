from telegram import Update
from telegram.ext import ApplicationBuilder, MessageHandler, CommandHandler, filters, ContextTypes
import requests

# 🔑 REEMPLAZA ESTO
TELEGRAM_TOKEN = "PON_TU_TOKEN_AQUI"
GEMINI_API_KEY = "PON_TU_API_GEMINI"

# 👤 Usuarios y contraseñas
usuarios = {
    "Facuw": "1010",
    "admin": "1010"
}

# 📊 Estados
logins = {}

# 🔐 Login comando
async def login(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        user = context.args[0]
        password = context.args[1]

        if user in usuarios and usuarios[user] == password:
            logins[update.effective_user.id] = user
            await update.message.reply_text(f"✅ Bienvenido {user}")
        else:
            await update.message.reply_text("❌ Usuario o contraseña incorrecta")
    except:
        await update.message.reply_text("Uso: /login usuario contraseña")

# 🤖 IA (Gemini)
def preguntar_ai(texto):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={GEMINI_API_KEY}"

    data = {
        "contents": [{"parts": [{"text": texto}]}]
    }

    response = requests.post(url, json=data)
    result = response.json()

    try:
        return result["candidates"][0]["content"]["parts"][0]["text"]
    except:
        return "Error al generar respuesta"

# 💬 Mensajes
async def responder(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id

    if user_id not in logins:
        await update.message.reply_text("🔒 Debes iniciar sesión con /login usuario contraseña")
        return

    texto = update.message.text
    respuesta = preguntar_ai(texto)

    await update.message.reply_text(respuesta)

# 🚀 Main
def main():
    app = ApplicationBuilder().token(TELEGRAM_TOKEN).build()

    app.add_handler(CommandHandler("login", login))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, responder))

    print("🤖 Bot corriendo...")
    app.run_polling()

if __name__ == "__main__":
    main()
