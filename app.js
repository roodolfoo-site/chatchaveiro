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



/* IDENTIFICAR SERVIÇO */

function identificarServico(msg){

msg=msg.toLowerCase()

/* abertura */

if(
msg.includes("chave dentro") ||
msg.includes("chave no carro") ||
msg.includes("chave no veiculo") ||
msg.includes("trancado") ||
msg.includes("me tranquei") ||
msg.includes("abrir") ||
msg.includes("porta travou")
){
return "abertura"
}

/* perdeu chave */

if(
msg.includes("perdi") ||
msg.includes("perdeu") ||
msg.includes("sumiu chave")
){
return "abertura"
}

/* copia */

if(
msg.includes("copiar") ||
msg.includes("copia") ||
msg.includes("segunda chave") ||
msg.includes("fazer chave")
){
return "copia"
}

/* conserto */

if(
msg.includes("quebrou") ||
msg.includes("miolo") ||
msg.includes("fechadura") ||
msg.includes("conserto") ||
msg.includes("travou")
){
return "conserto"
}

return null

}



/* IDENTIFICAR LOCAL */

function identificarTipo(msg){

msg=msg.toLowerCase()

if(
msg.includes("carro") ||
msg.includes("veiculo") ||
msg.includes("automovel")
){
return "automotivo"
}

if(
msg.includes("casa") ||
msg.includes("apartamento") ||
msg.includes("porta")
){
return "residencial"
}

if(
msg.includes("empresa") ||
msg.includes("loja") ||
msg.includes("comercio")
){
return "comercial"
}

return null

}



/* VALOR DO SERVIÇO */

function calcularValorServico(tipo){

if(tipo==="automotivo"){
return 180
}

return 120

}



/* HORA */

function hora(){

const agora=new Date()

let h=agora.getHours().toString().padStart(2,"0")
let m=agora.getMinutes().toString().padStart(2,"0")

return h+":"+m

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



/* MENSAGEM COM FOTO */

function addBotImage(text){

const msg=document.createElement("div")

msg.className="msg bot"

msg.innerHTML=`
<img src="tecnico.jpg" style="width:100%;border-radius:8px;margin-bottom:6px;">
${text}
<div class="time">${hora()}</div>
`

messages.appendChild(msg)

scrollChat()

}



/* DIGITAÇÃO */

function typing(){

const msg=document.createElement("div")

msg.className="msg bot typing-box"

msg.innerHTML=`
<div class="typing">
<span></span>
<span></span>
<span></span>
</div>
`

messages.appendChild(msg)

scrollChat()

return msg

}

function responder(texto){

const t=typing()

setTimeout(()=>{

t.remove()
addBotMessage(texto)

},1200)

}



/* ENVIO */

async function send(){

const texto=input.value.trim()

if(!texto) return

addUserMessage(texto)

input.value=""

const msg=texto.toLowerCase()



/* IDENTIFICAR SERVIÇO */

if(etapa==="identificar_servico"){

const servico=identificarServico(msg)

if(!servico){

responder("Entendi 👍 Para direcionar o técnico corretamente preciso entender o serviço.")

setTimeout(()=>{
addBotMessage("Você precisa de abertura, conserto ou cópia de chave?")
},1500)

return

}

cliente.servico=servico

const tipoDetectado=identificarTipo(msg)

responder("Entendi 👍 vamos resolver isso para você.")

/* se já detectou local */

if(tipoDetectado){

cliente.tipoLocal=tipoDetectado

setTimeout(()=>{
addBotMessage("Pode me informar o endereço do local?")
},1500)

etapa="endereco"

return

}

/* perguntar tipo */

setTimeout(()=>{
addBotMessage("Esse serviço é residencial, comercial ou automotivo?")
},1500)

etapa="tipo_local"

return

}



/* TIPO */

if(etapa==="tipo_local"){

cliente.tipoLocal=texto

responder("Perfeito 👍")

setTimeout(()=>{
addBotMessage("Pode me informar o endereço do local?")
},1500)

etapa="endereco"

return

}



/* ENDEREÇO */

if(etapa==="endereco"){

cliente.endereco=texto

responder("Perfeito 👍")

setTimeout(()=>{
addBotMessage("Qual é o seu nome?")
},1500)

etapa="nome"

return

}



/* NOME */

if(etapa==="nome"){

cliente.nome=texto

responder(`Prazer ${cliente.nome} 😊`)

setTimeout(()=>{
addBotMessage("Agora me informe seu telefone 📞 para contato.")
},1500)

etapa="telefone"

return

}



/* TELEFONE */

if(etapa==="telefone"){

cliente.telefone=texto

tecnicoAtual=tecnicos[0]

tempoChegada=tempos[Math.floor(Math.random()*tempos.length)]

const valorServico = calcularValorServico(cliente.tipoLocal)

responder("Perfeito 👍")

setTimeout(()=>{
addBotMessage("Vou verificar um técnico disponível próximo de você...")
},1500)

setTimeout(()=>{
addBotMessage("Só um momento enquanto verifico aqui...")
},3000)

setTimeout(()=>{

addBotMessage("Tenho um técnico finalizando um atendimento próximo do seu endereço.")

setTimeout(()=>{

addBotImage(`✔ Técnico confirmado<br><br>
Nome: ${tecnicoAtual.nome}<br>
Valor do serviço: R$${valorServico}`)

setTimeout(()=>{

addBotMessage(`Ele consegue chegar em aproximadamente ${tempoChegada}.`)

setTimeout(()=>{
addBotMessage("Deseja que eu reserve esse técnico para você agora?")
},2000)

},2000)

},2000)

},8000)

etapa="confirmacao"

return

}

}



/* ENTER */

input.addEventListener("keypress",function(e){

if(e.key==="Enter"){
send()
}

})
