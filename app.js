// ⚠️ COLOQUE SUA CHAVE PIX AQUI
const CHAVE_PIX = "11999999999"
const VALOR_SINAL = 50

const messages = document.getElementById("messages")
const input = document.getElementById("text")

let cliente={
endereco:"",
telefone:"",
nome:""
}

let etapa="inicio"

const tecnicos=[{nome:"Antonio Carlos"}]

const tempos=[
"15 a 20 minutos",
"18 a 25 minutos",
"20 a 30 minutos",
"25 a 35 minutos"
]

let tecnicoAtual=null



/* IA */
async function respostaIA(texto){
try{
const res=await fetch("/chat",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({ message:texto })
})
const data=await res.json()
return data.reply
}catch{
return "Já vou te ajudar 👍"
}
}



/* HORA */
function hora(){
const agora=new Date()
return agora.getHours().toString().padStart(2,"0")+":"+agora.getMinutes().toString().padStart(2,"0")
}

function scrollChat(){
messages.scrollTop=messages.scrollHeight
}



/* MENSAGENS */
function addUserMessage(text){
const msg=document.createElement("div")
msg.className="msg user"
msg.innerHTML=text+`<div class="time">${hora()}</div>`
messages.appendChild(msg)
scrollChat()
}

function addBotMessage(text){
const msg=document.createElement("div")
msg.className="msg bot"
msg.innerHTML=text+`<div class="time">${hora()}</div>`
messages.appendChild(msg)
scrollChat()
}

function addBotImage(text){
const msg=document.createElement("div")
msg.className="msg bot"
msg.innerHTML=`
<img src="tecnico.jpg" style="width:100%;border-radius:8px;margin-bottom:6px;">
${text}
<div class="time">${hora()}</div>`
messages.appendChild(msg)
scrollChat()
}



/* DIGITAÇÃO */
function typing(){
const msg=document.createElement("div")
msg.className="msg bot typing-box"
msg.innerHTML=`<div class="typing"><span></span><span></span><span></span></div>`
messages.appendChild(msg)
scrollChat()
return msg
}



/* ENVIO */
async function send(){

const texto=input.value.trim()
if(!texto) return

addUserMessage(texto)
input.value=""



/* IA PRIMEIRO */

if(etapa==="inicio"){

const t=typing()

const resposta = await respostaIA(texto)

t.remove()
addBotMessage(resposta)

setTimeout(()=>{
addBotMessage("Pode me informar o endereço completo? (rua e número)")
},1200)

etapa="endereco"
return
}



/* ENDEREÇO */

if(etapa==="endereco"){

if(!texto.match(/\d+/)){
addBotMessage("Preciso do endereço completo (rua e número).")
return
}

cliente.endereco=texto

addBotMessage("Perfeito 👍 já localizei sua região.")

setTimeout(()=>{
addBotMessage("Qual é o seu nome?")
},1200)

etapa="nome"
return
}



/* NOME */

if(etapa==="nome"){

cliente.nome=texto

addBotMessage(`Prazer ${cliente.nome} 😊`)

setTimeout(()=>{
addBotMessage("Agora me informe seu telefone 📞")
},1200)

etapa="telefone"
return
}



/* TELEFONE */

if(etapa==="telefone"){

cliente.telefone=texto

tecnicoAtual=tecnicos[0]
const tempo=tempos[Math.floor(Math.random()*tempos.length)]

addBotMessage("Já encontrei um técnico próximo de você.")

setTimeout(()=>{
addBotImage(`✔ Técnico disponível<br><br>
Nome: ${tecnicoAtual.nome}`)
},1500)

setTimeout(()=>{
addBotMessage(`Ele chega em aproximadamente ${tempo}.`)
},3000)

setTimeout(()=>{
addBotMessage("Posso confirmar esse atendimento para você agora?")
},4500)

etapa="confirmacao"
return
}



/* CONFIRMAÇÃO + PIX */

if(etapa==="confirmacao"){

const msg = texto.toLowerCase()

if(
msg.includes("sim") ||
msg.includes("pode") ||
msg.includes("confirmar") ||
msg.includes("ok") ||
msg.includes("quero")
){

addBotMessage("Perfeito 👍 para garantir o envio do técnico, é necessário um sinal.")

setTimeout(()=>{
addBotMessage(`O valor do sinal é de R$${VALOR_SINAL}.`)
},1500)

setTimeout(()=>{
addBotMessage(`Chave PIX: ${CHAVE_PIX}`)
},3000)

setTimeout(()=>{
addBotMessage("Assim que realizar o pagamento, me envie o comprovante por aqui para liberar o técnico imediatamente.")
},4500)

etapa="aguardando_pagamento"
return
}

if(
msg.includes("não") ||
msg.includes("nao")
){
addBotMessage("Sem problema 👍 se precisar é só me chamar.")
etapa="finalizado"
return
}

addBotMessage("Deseja que eu confirme o atendimento agora?")
return
}



/* PAGAMENTO */

if(etapa==="aguardando_pagamento"){

addBotMessage("Assim que você enviar o comprovante, já libero o técnico imediatamente 👍")

return
}

}



/* ENTER */
input.addEventListener("keypress",function(e){
if(e.key==="Enter") send()
})
