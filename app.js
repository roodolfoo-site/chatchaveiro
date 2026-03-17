// ⚠️ CONFIG
const CHAVE_PIX = "11999999999"

const messages = document.getElementById("messages")
const input = document.getElementById("text")

let cliente = {
  endereco: "",
  bairro: "",
  telefone: "",
  nome: "",
  problema: "",
  valor: 120
}

let etapa = "inicio"

const tecnicoFixo = { nome: "Antonio Carlos" }



/* 🔥 IDENTIFICAR VALOR */
function definirValor(texto){
  const t = texto.toLowerCase()

  if(t.includes("eletronica") || t.includes("digital") || t.includes("senha")){
    return 250
  }

  if(t.includes("perdi") || t.includes("codificada")){
    return 250
  }

  if(t.includes("quebrou") || t.includes("fechadura")){
    return 180
  }

  return 120
}



/* 🚨 ENVIA LEAD */
async function enviarLead(){
  try{
    await fetch("/lead",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(cliente)
    })
  }catch(e){}
}



/* IA */
async function respostaIA(texto){
  try{
    const res = await fetch("/chat",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ message:texto })
    })
    const data = await res.json()
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
  messages.scrollTop = messages.scrollHeight
}



/* MENSAGENS */
function addUserMessage(text){
  const msg = document.createElement("div")
  msg.className = "msg user"
  msg.innerHTML = text + `<div class="time">${hora()}</div>`
  messages.appendChild(msg)
  scrollChat()
}

function addBotMessage(text){
  const msg = document.createElement("div")
  msg.className = "msg bot"
  msg.innerHTML = text + `<div class="time">${hora()}</div>`
  messages.appendChild(msg)
  scrollChat()
}

function addBotImage(text){
  const msg = document.createElement("div")
  msg.className = "msg bot"
  msg.innerHTML = `
  <img src="tecnico.jpg" style="width:100%;border-radius:8px;margin-bottom:6px;">
  ${text}
  <div class="time">${hora()}</div>`
  messages.appendChild(msg)
  scrollChat()
}



/* PIX */
function mostrarPix(valor){

  const metade = valor / 2
  const payload = CHAVE_PIX

  const msg=document.createElement("div")
  msg.className="msg bot"

  msg.innerHTML=`
  <div style="text-align:center">

    <div style="margin-bottom:8px;font-weight:600">
      Pagamento via PIX
    </div>

    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${payload}" 
    style="border-radius:10px;margin-bottom:10px;">

    <div style="margin-bottom:8px;font-size:14px">
      Esse tipo de serviço normalmente custa entre <b>R$120 e R$250</b>.<br><br>
      No seu caso: <b>R$${valor}</b><br>
      Para garantir o atendimento imediato: <b>R$${metade}</b>
    </div>

    <div style="background:#f2f2f2;padding:8px;border-radius:8px;font-size:12px;word-break:break-all;margin-bottom:8px">
      ${payload}
    </div>

    <button onclick="copiarPix('${payload}')" style="
      background:#25D366;
      color:white;
      border:none;
      padding:10px 14px;
      border-radius:8px;
      cursor:pointer;
      font-weight:600;
    ">
      Copiar PIX
    </button>

  </div>

  <div class="time">${hora()}</div>
  `

  messages.appendChild(msg)
  scrollChat()
}

function copiarPix(texto){
  navigator.clipboard.writeText(texto)
  alert("PIX copiado 👍")
}



/* ENVIO */
async function send(){

  const texto = input.value.trim()
  if(!texto) return

  addUserMessage(texto)
  input.value = ""



  /* INÍCIO */
  if(etapa==="inicio"){

    cliente.problema = texto
    cliente.valor = definirValor(texto)

    const resposta = await respostaIA(texto)
    addBotMessage(resposta)

    setTimeout(()=>{
      addBotMessage("Me passa seu endereço completo (rua, número e bairro) 👍")
    },1200)

    etapa="endereco"
    return
  }



  /* ENDEREÇO */
  if(etapa==="endereco"){

    if(!texto.match(/\d+/) || texto.split(" ").length < 3){
      addBotMessage("Preciso da rua, número e bairro para localizar o técnico mais próximo com precisão 👍")
      return
    }

    cliente.endereco = texto

    setTimeout(()=>{
      addBotMessage("Qual é o seu nome?")
    },1000)

    etapa="nome"
    return
  }



  /* NOME */
  if(etapa==="nome"){

    cliente.nome = texto

    setTimeout(()=>{
      addBotMessage("Me passa seu telefone 📞")
    },1000)

    etapa="telefone"
    return
  }



  /* TELEFONE */
  if(etapa==="telefone"){

    cliente.telefone = texto

    enviarLead()

    addBotMessage("Estou localizando um técnico próximo...")

    setTimeout(()=>{
      addBotImage(`✔ Técnico disponível<br><br>Nome: ${tecnicoFixo.nome}`)
    },25000)

    setTimeout(()=>{
      addBotMessage("Posso reservar agora? Tenho ele disponível nesse momento 👍")
    },26000)

    etapa="confirmacao"
    return
  }



  /* CONFIRMAÇÃO */
  if(etapa==="confirmacao"){

    const msg = texto.toLowerCase()

    if(msg.includes("sim") || msg.includes("ok") || msg.includes("quero")){

      addBotMessage("Como é atendimento imediato, a agenda é por ordem de confirmação 👍")

      setTimeout(()=>{
        addBotMessage("Esse valor é apenas para garantir o deslocamento, e é abatido do total do serviço 👍")
      },1000)

      setTimeout(()=>{
        mostrarPix(cliente.valor)
      },2000)

      setTimeout(()=>{
        addBotMessage("Assim que me enviar o comprovante, já libero ele imediatamente pra sua rota 👍")
      },4000)

      etapa="aguardando_pagamento"
      return
    }

    addBotMessage("Posso reservar para o técnico ir até você?")
    return
  }

}



/* ENTER */
input.addEventListener("keydown",function(e){
  if(e.key==="Enter"){
    e.preventDefault()
    send()
  }
})
