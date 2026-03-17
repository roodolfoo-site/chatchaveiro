const messages = document.getElementById("messages")
const input = document.getElementById("text")

let cliente={
servico:"",
tipoLocal:"",
endereco:"",
telefone:"",
nome:""
}

let etapa="identificar_servico"

const tecnicos=[
{nome:"Antonio Carlos"}
]

const tempos=[
"15 a 20 minutos",
"18 a 25 minutos",
"20 a 30 minutos",
"25 a 35 minutos"
]

let tecnicoAtual=null
let tempoChegada="20 a 30 minutos"



/* IA (NOVO) */
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



/* IDENTIFICAR SERVIÇO */

function identificarServico(msg){

msg=msg.toLowerCase()

if(
msg.includes("perdi") ||
msg.includes("chave dentro") ||
msg.includes("chave no carro") ||
msg.includes("trancado") ||
msg.includes("me tranquei") ||
msg.includes("abrir") ||
msg.includes("porta travou")
){
return "abertura"
}

if(
msg.includes("copiar") ||
msg.includes("copia") ||
msg.includes("segunda chave")
){
return "copia"
}

if(
msg.includes("quebrou") ||
msg.includes("miolo") ||
msg.includes("fechadura") ||
msg.includes("conserto")
){
return "conserto"
}

return null
}



/* IDENTIFICAR LOCAL */

function identificarTipo(msg){

msg=msg.toLowerCase()

if(msg.includes("carro") || msg.includes("veiculo")) return "automotivo"
if(msg.includes("casa") || msg.includes("apartamento")) return "residencial"
if(msg.includes("empresa") || msg.includes("loja")) return "comercial"

return null
}



/* VALOR */

function calcularValorServico(tipo){
return tipo==="automotivo" ? 180 : 120
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

const msg=texto.toLowerCase()



/* PRIMEIRA ETAPA COM IA */

if(etapa==="identificar_servico"){

const t=typing()

const resposta = await respostaIA(texto)

t.remove()
addBotMessage(resposta)

/* CONTINUA SEU FLUXO NORMAL */

const servico=identificarServico(msg)

if(!servico){
setTimeout(()=>{
addBotMessage("Você precisa de abertura, conserto ou cópia de chave?")
},1500)
return
}

cliente.servico=servico

const tipoDetectado=identificarTipo(msg)

if(tipoDetectado){
cliente.tipoLocal=tipoDetectado

setTimeout(()=>{
addBotMessage("Pode me informar o endereço completo? (rua e número)")
},1500)

etapa="endereco"
return
}

setTimeout(()=>{
addBotMessage("Esse atendimento é em casa, empresa ou veículo?")
},1500)

etapa="tipo_local"
return
}



/* TIPO */

if(etapa==="tipo_local"){

cliente.tipoLocal=texto

addBotMessage("Perfeito 👍")

setTimeout(()=>{
addBotMessage("Pode me informar o endereço completo? (rua e número)")
},1500)

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
},1500)

etapa="nome"
return
}



/* NOME */

if(etapa==="nome"){

cliente.nome=texto

addBotMessage(`Prazer ${cliente.nome} 😊`)

setTimeout(()=>{
addBotMessage("Agora me informe seu telefone 📞")
},1500)

etapa="telefone"
return
}



/* TELEFONE */

if(etapa==="telefone"){

cliente.telefone=texto

tecnicoAtual=tecnicos[0]
tempoChegada=tempos[Math.floor(Math.random()*tempos.length)]

const valor=calcularValorServico(cliente.tipoLocal)

addBotMessage("Já encontrei um técnico próximo de você.")

setTimeout(()=>{
addBotImage(`✔ Técnico disponível<br><br>
Nome: ${tecnicoAtual.nome}<br>
Valor: R$${valor}`)
},2000)

setTimeout(()=>{
addBotMessage(`Ele chega em aproximadamente ${tempoChegada}.`)
},3500)

setTimeout(()=>{
addBotMessage("Posso confirmar esse atendimento para você agora?")
},5000)

etapa="confirmacao"
return
}

}



/* ENTER */

input.addEventListener("keypress",function(e){
if(e.key==="Enter") send()
})
