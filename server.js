const express = require("express")
const path = require("path")

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args))

const app = express()

app.use(express.json())
app.use(express.static(__dirname))

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "chat.html"))
})

const OPENAI_API_KEY = "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"

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

Responda curto e peça o endereço.
`
      })
    })

    const data = await resposta.json()

    const respostaIA =
      data.output?.[0]?.content?.[0]?.text ||
      "Estou verificando 👍"

    res.json({ reply: respostaIA })

  } catch (erro) {

    console.log(erro)

    res.json({
      reply: "Estou verificando 👍"
    })

  }

})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Servidor rodando")
})
