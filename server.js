const express = require("express")
const path = require("path")

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args))

const app = express()

app.use(express.json())

/* servir arquivos */
app.use(express.static(__dirname))

/* rota principal */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "chat.html"))
})

/* ========================= */
/* CHAT */
/* ========================= */

const OPENAI_API_KEY = "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"

app.post("/chat", async (req, res) => {

  const pergunta = req.body.message

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
          messages: [
            { role: "system", content: "Você é Thais da central de chaveiros." },
            { role: "user", content: pergunta }
          ]
        })
      }
    )

    const data = await resposta.json()

    res.json({
      reply: data.choices[0].message.content
    })

  } catch (err) {

    res.json({
      reply: "Estou verificando 👍"
    })

  }

})

/* ========================= */

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Servidor rodando")
})
