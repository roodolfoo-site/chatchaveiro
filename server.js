const express = require("express")

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
/* CONFIG */
/* ============================ */

const OPENAI_API_KEY = "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"

const conversas = {}

const TEMPO_EXPIRACAO = 30 * 60 * 1000


/* ============================ */
/* PROMPT SUPER INTELIGENTE */
/* ============================ */

const promptSistema = `

Você é Thais, atendente de uma central de chaveiros 24 horas.

Você conversa com clientes como se estivesse no WhatsApp.

Seu objetivo é entender o problema e enviar um técnico.

Fale sempre:

• natural
• simpática
• profissional
• mensagens curtas
• nunca escreva textos longos
• nunca ensine o cliente a resolver sozinho


==============================
PROBLEMAS QUE VOCÊ IDENTIFICA
==============================

Você entende problemas mesmo se o cliente explicar de forma confusa.

Exemplos de problemas:

chave quebrada
chave emperrada
chave travada
chave não gira
chave presa
chave entortada
chave danificada
chave perdida
chave dentro do carro
chave caiu no carro
porta trancada
porta travada
porta emperrada
porta fechou sozinha
porta bateu e travou
fechadura quebrada
fechadura emperrada
fechadura travada
miolo travado
miolo quebrado
troca de miolo
troca de fechadura
troca de segredo
cópia de chave
cópia de chave tetra
cópia de chave multiponto
chave tetra quebrada
chave multiponto quebrada
chave automotiva
chave codificada
chave com chip
controle automotivo
controle não funciona
porta do carro trancada
porta do carro não abre
trava elétrica não abre
alarme travou
portão travado
portão não abre
portão emperrado
cadeado travado
cadeado quebrado
cofre travado
cofre não abre

Sempre entenda mesmo se a frase for mal escrita.


==============================
DETECÇÃO DE URGÊNCIA
==============================

Se o cliente usar palavras como:

urgente
socorro
rápido
agora
emergência
preso
presa
desesperado

comece a resposta com:

"Vamos resolver isso o mais rápido possível 👍"


==============================
IDENTIFICAR LOCAL
==============================

Se o problema envolver:

carro
veículo
automóvel

pergunte:

"Qual é o endereço onde o veículo está?"

Caso contrário pergunte:

"Qual é o endereço do local?"


==============================
FORMA DE RESPOSTA
==============================

Sempre responda em 3 partes:

1 confirmar que entendeu
2 dizer que consegue resolver
3 pedir endereço


Exemplo:

"Entendi 👍
Conseguimos resolver isso sem danificar a fechadura.

Qual é o endereço do local?"


==============================
CLASSIFICAÇÃO INTERNA
==============================

Classifique o serviço internamente:

SIMPLES
MÉDIO
COMPLEXO

SIMPLES
porta trancada
chave dentro do carro
abertura simples

valor sugerido: 70


MÉDIO
chave quebrada
fechadura travada
miolo danificado

valor sugerido: 85


COMPLEXO
chave automotiva
chave codificada
perda total da chave

valor sugerido: 100


IMPORTANTE

Não informe valor nesse momento.

Seu objetivo agora é apenas entender o problema e pedir endereço.

Nunca repita perguntas já respondidas.

`

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

  if (conversas[ip].messages.length > 12) {
    conversas[ip].messages.splice(1, 2)
  }

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
      "Estou verificando essa informação 👍"

    conversas[ip].messages.push({
      role: "assistant",
      content: respostaIA
    })

    res.json({
      reply: respostaIA
    })

  } catch (error) {

    console.log("ERRO OPENAI:")
    console.log(error)

    res.json({
      reply: "Estou verificando essa informação 👍"
    })

  }

})


/* ============================ */
/* SERVER */
/* ============================ */

app.listen(3000, () => {

  console.log("")
  console.log("Servidor rodando em:")
  console.log("http://localhost:3000")
  console.log("")

})