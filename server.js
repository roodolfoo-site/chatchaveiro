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

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

app.post("/chat", async (req, res) => {

  const pergunta = req.body.message

  try {

    const resposta = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        temperature: 0.7,
        max_tokens: 120,
        messages: [
          {
            role: "system",
            content: `
Você é Thais, atendente de uma central de chaveiro 24h.

FUNÇÃO:
- entender o problema do cliente
- explicar rapidamente o que aconteceu
- tranquilizar o cliente

REGRAS:
- fale como humano, natural
- respostas curtas (máximo 2 linhas)
- NÃO peça endereço
- NÃO faça perguntas
- NÃO conduza atendimento
- apenas responda explicando o problema

EXEMPLOS:

"Isso acontece bastante quando o carro trava automaticamente. Fica tranquilo que conseguimos abrir sem danificar."

"Quando a chave quebra, normalmente parte fica presa. A gente resolve isso sem danificar a fechadura."

"Sem problema, conseguimos fazer uma nova chave no local mesmo."
`
          },
          {
            role: "user",
            content: pergunta
          }
        ]
      })
    })

    const data = await resposta.json()

    const respostaIA =
      data.choices?.[0]?.message?.content ||
      "Já vou te ajudar 👍"

    res.json({ reply: respostaIA })

  } catch (erro) {

    console.log("ERRO OPENAI:", erro)

    res.json({
      reply: "Já vou te ajudar 👍"
    })

  }

})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT)
})
