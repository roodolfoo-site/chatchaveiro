const express = require("express")
const path = require("path")

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args))

const app = express()

app.use(express.json())

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")
  next()
})

/* ============================ */
/* SERVIR ARQUIVOS HTML */
/* ============================ */

app.use(express.static(__dirname))

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "chat.html"))
})

/* ============================ */
/* CONFIG */
/* ============================ */

const OPENAI_API_KEY = "SUA_API_KEY_AQUI"

const conversas = {}

const TEMPO_EXPIRACAO = 30 * 60 * 1000


/* ============================ */
/* PROMPT */
/* ============================ */

const promptSistema = `Você é Thais, atendente de uma central de chaveiros 24 horas.

Converse como se estivesse no WhatsApp.

Respostas curtas.
Seja simpática.
Peça o endereço após entender o problema.

Nunca ensine o cliente a resolver sozinho.`


/* ============================ */
/* CHAT */
/* ============================ */

app.post("/chat", async (req, res) => {

  const pergunta = req.body.message

  const ip =
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    "user"

  const agora = Date.now()

  if (!conversas[ip]) {

    conversas[ip] = {
      messages: [
        {
          role: "system",
          content: promptSistema
        }
      ],
      lastActivity: agora
    }

  }

  if (agora - conversas[ip].lastActivity > TEMPO_EXPIRACAO) {

    conversas[ip] = {
      messages: [
        {
          role: "system",
          content: promptSistema
        }
      ],
      lastActivity: agora
    }

  }

  conversas[ip].lastActivity = agora

  conversas[ip].messages.push({
    role: "user",
    content: pergunta
  })

  try {

    const resposta = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: conversas[ip].messages,
          temperature: 0.7,
          max_tokens: 120
        })
      }
    )

    const data = await resposta.json()

    const respostaIA =
      data.choices?.[0]?.message?.content ||
      "Estou verificando 👍"

    conversas[ip].messages.push({
      role: "assistant",
      content: respostaIA
    })

    res.json({
      reply: respostaIA
    })

  } catch (error) {

    console.log("ERRO OPENAI:", error)

    res.json({
      reply: "Estou verificando 👍"
    })

  }

})


/* ============================ */
/* SERVER */
/* ============================ */

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {

  console.log("")
  console.log("Servidor rodando")
  console.log("")

})
