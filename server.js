const express = require("express")
const path = require("path")
const cors = require("cors")

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args))

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static(__dirname))

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "chat.html"))
})

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

app.post("/chat", async (req, res) => {

  const pergunta = req.body.message

  if (!pergunta) {
    return res.json({ reply: "Pode me explicar melhor o que aconteceu?" })
  }

  try {

    const resposta = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        temperature: 0.8,
        max_tokens: 100,
        messages: [
          {
            role: "system",
            content: `
Você é Thais, atendente de uma central de chaveiro 24h.

OBJETIVO:
Responder como uma atendente real, de forma rápida, natural e segura, explicando o problema do cliente.

REGRAS:
- fale como humano, informal e natural
- respostas curtas (1 ou 2 frases no máximo)
- transmita segurança e solução
- NUNCA peça dados (endereço, telefone, etc)
- NUNCA faça perguntas
- NÃO conduza atendimento
- apenas explique o problema de forma tranquila

ESTILO:
- use linguagem simples
- pode usar 👍 ou 😊
- evite parecer robô

EXEMPLOS:

"Isso acontece bastante quando o carro trava sozinho. Fica tranquilo que dá pra abrir sem danificar 👍"

"Quando a chave quebra, geralmente um pedaço fica preso. A gente resolve isso sem mexer na fechadura 😊"

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
      reply: "Tô verificando aqui pra você 👍"
    })

  }

})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT)
})
