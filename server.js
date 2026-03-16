const express = require("express")
const path = require("path")

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args))

const app = express()

app.use(express.json())
app.use(express.static(__dirname))

/* rota principal */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "chat.html"))
})

/* API KEY vem do Render */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

/* rota do chat */

app.post("/chat", async (req, res) => {

  const pergunta = req.body.message

  try {

    const resposta = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: `
Você é Thais, atendente simpática de uma central de chaveiro 24h.

Cliente disse:
${pergunta}

Responda de forma curta, simpática e peça o endereço do local.
`
      })
    })

    const data = await resposta.json()

    console.log("RESPOSTA OPENAI:", data)

    let respostaIA = "Estou verificando 👍"

    if (data.output_text) {
      respostaIA = data.output_text
    }

    res.json({ reply: respostaIA })

  } catch (erro) {

    console.log("ERRO OPENAI:", erro)

    res.json({
      reply: "Estou verificando 👍"
    })

  }

})

/* servidor */

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Servidor rodando")
})
