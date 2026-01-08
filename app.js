let verified = false;
let user = null;

function add(msg) {
  const chat = document.getElementById("chat");
  chat.innerHTML += `<p>${msg}</p>`;
}

add("BEKA AI: Ingresa la contraseña");

async function send() {
  const input = document.getElementById("input");
  const text = input.value;
  input.value = "";

  add("Tú: " + text);

  const res = await fetch("/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, verified, user })
  });

  const data = await res.json();
  verified = data.verified;
  user = data.user;

  add("BEKA AI: " + data.reply);
}
