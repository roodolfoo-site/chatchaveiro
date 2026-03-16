const express = require("express")
const path = require("path")

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args))

const app = express()

app.use(express.json())

/* arquivos estáticos */

app.use(express.static(__dirname))

/* rota principal */

app.get("/", (req,res)=>{
res.sendFile(path.join(__dirname,"chat.html"))
})

/* ================= */
/* CONFIG            */
/* ================= */

const OPENAI_API_KEY = "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"

/* ================= */
/* CHAT              */
/* ================= */

app.post("/chat", async (req,res)=>{

const pergunta = req.body.message

try{

const resposta = await fetch(
"https://api.openai.com/v1/chat/completions",
{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${OPENAI_API_KEY}`
},
body:JSON.stringify({

model:"gpt-4o-mini",

messages:[
{
role:"system",
content:"Você é Thais, atendente simpática de uma central de chaveiro 24h. Sempre entenda o problema do cliente e peça o endereço."
},
{
role:"user",
content:pergunta
}
],

temperature:0.7,
max_tokens:120

})
}
)

const data = await resposta.json()

const respostaIA =
data.choices?.[0]?.message?.content ||
"Estou verificando 👍"

res.json({reply:respostaIA})

}catch(err){

console.log(err)

res.json({
reply:"Estou verificando 👍"
})

}

})

/* ================= */
/* SERVER            */
/* ================= */

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
console.log("Servidor rodando")
})
