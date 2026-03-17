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
        messages: [
          {
            role: "system",
            content: `
Você é Thais, atendente de uma central de chaveiro 24h.

Seu objetivo:
- entender o problema do cliente
- explicar rapidamente o que aconteceu
- tranquilizar o cliente
- conduzir naturalmente para pedir o endereço

REGRAS IMPORTANTES:
- fale como humano, nunca como robô
- seja direta, mas simpática
- respostas curtas (máximo 2 a 3 linhas)
- nunca peça endereço seco, sempre depois de explicar
- use linguagem simples

COMPORTAMENTO:
- se for carro: diga que dá pra abrir sem danificar
- se for chave quebrada: diga que remove sem estragar
- se for perda: diga que faz chave no local
- sempre transmita segurança

EXEMPLO:
"Entendi, isso acontece bastante quando o carro trava automaticamente. Fica tranquilo que conseguimos abrir sem danificar nada.

Me passa seu endereço que já vejo um técnico próximo de você."
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

    console.log("OPENAI RESPONSE:", data)

    const respostaIA =
      data.choices?.[0]?.message?.content ||
      "Já vou te ajudar, só um instante 👍"

    res.json({ reply: respostaIA })

  } catch (erro) {

    console.log("ERRO OPENAI:", erro)

    res.json({
      reply: "Tive um probleminha aqui, mas já vou te ajudar 👍"
    })

  }

})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT)
})
