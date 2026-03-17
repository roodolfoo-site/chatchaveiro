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

// 🔥 Z-API CONFIG
const INSTANCE_ID = "3F0455D41A0E631E4DA8BE013F70DD68"
const TOKEN = "A7EF09DC13E425872118D2CC"
const SEU_NUMERO = "5511986731361"


/* 🚨 ENVIA WHATSAPP */
async function enviarWhatsApp(mensagem){
  try{
    await fetch(`https://api.z-api.io/instances/${INSTANCE_ID}/token/${TOKEN}/send-text`,{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        phone: SEU_NUMERO,
        message: mensagem
      })
    })
  }catch(e){
    console.log("Erro WhatsApp:", e)
  }
}



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
Responder como uma atendente real, com segurança e naturalidade, explicando o problema do cliente.

REGRAS:
- fale como humano, informal e natural
- respostas curtas (1 ou 2 frases)
- transmita segurança e solução
- nunca peça dados (endereço, telefone, etc)
- nunca faça perguntas
- não conduza atendimento
- apenas explique o problema

ESPECIALIDADES:
- chaves comuns
- chaves automotivas
- fechaduras residenciais
- fechaduras eletrônicas/digitais

IMPORTANTE SOBRE FECHADURA ELETRÔNICA:
- entenda casos como:
  - senha não funciona
  - fechadura travada
  - erro eletrônico
  - bateria fraca
- nesses casos, responda como especialista

EXEMPLOS:

"Isso acontece bastante quando o carro trava sozinho. Fica tranquilo que dá pra abrir sem danificar 👍"

"Quando a chave quebra, normalmente uma parte fica presa. A gente resolve isso sem mexer na fechadura."

"Fechaduras eletrônicas podem travar por bateria fraca ou erro no sistema. Conseguimos resolver isso no local sem danificar."

"Quando a fechadura digital para de responder, geralmente é falha eletrônica ou bateria. A gente resolve rapidamente 👍"
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


// 🔥 NOVA ROTA PARA RECEBER LEAD
app.post("/lead", async (req, res) => {

  const { nome, telefone, bairro, problema } = req.body

  const mensagem = `🚨 Novo lead

Nome: ${nome}
Telefone: ${telefone}
Bairro: ${bairro}
Problema: ${problema}`

  await enviarWhatsApp(mensagem)

  res.json({ ok: true })

})



const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT)
})
