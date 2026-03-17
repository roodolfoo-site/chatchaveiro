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

const tempos = [
  "15 a 20 minutos",
  "18 a 25 minutos",
  "20 a 30 minutos"
]



/* 🔥 IDENTIFICAR VALOR */
function definirValor(texto){

  const t = texto.toLowerCase()

  if(
    t.includes("eletrônica") ||
    t.includes("eletronica") ||
    t.includes("digital") ||
    t.includes("senha") ||
    t.includes("biometria")
  ){
    return 250
  }

  if(
    t.includes("perdi a chave") ||
    t.includes("perda") ||
    t.includes("codificada") ||
    t.includes("canivete") ||
    t.includes("chave nova")
  ){
    return 250
  }

  if(
    t.includes("quebrou") ||
    t.includes("quebrada") ||
    t.includes("fechadura")
  ){
    return 180
  }

  return 120
}



/* 🚨 ENVIA LEAD PRO BACKEND */
async function enviarLead(){

  try{
    await fetch("/lead",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        nome: cliente.nome,
        telefone: cliente.telefone,
        bairro: cliente.bairro,
        problema: cliente.problema
      })
    })
  }catch(e){
    console.log("Erro ao enviar lead:", e)
  }

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
      Valor do serviço: <b>R$${valor}</b><br>
      Para envio do técnico: <b>R$${metade}</b>
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

    const partes = texto.split(" ")

    if(!texto.match(/\d+/) || partes.length < 3){
      addBotMessage("Preciso de rua, número e bairro 👍")
      return
    }

    cliente.endereco = texto
    cliente.bairro = partes[partes.length - 1]

    addBotMessage(`Já identifiquei sua região (${cliente.bairro}) 👍`)

    setTimeout(()=>{
      addBotMessage("Qual é o seu nome?")
    },1200)

    etapa="nome"
    return
  }



  /* NOME */

  if(etapa==="nome"){

    cliente.nome = texto
    addBotMessage(`Prazer ${cliente.nome} 😊`)

    setTimeout(()=>{
      addBotMessage("Me passa seu telefone 📞")
    },1200)

    etapa="telefone"
    return
  }



  /* TELEFONE */

  if(etapa==="telefone"){

    cliente.telefone = texto

    // 🔥 ENVIA PARA Z-API (BACKEND)
    enviarLead()

    const tempo = tempos[Math.floor(Math.random()*tempos.length)]

    addBotMessage("Já tenho um técnico próximo 👍")

    setTimeout(()=>{
      addBotImage(`✔ Técnico a caminho<br><br>Nome: ${tecnicoFixo.nome}`)
    },1500)

    setTimeout(()=>{
      addBotMessage(`Ele chega em aproximadamente ${tempo}.`)
    },3000)

    setTimeout(()=>{
      addBotMessage("Esse tipo de serviço normalmente custa entre R$120 e R$250.")
    },4500)

    setTimeout(()=>{
      addBotMessage(`No seu caso, fica em R$${cliente.valor}.`)
    },6000)

    setTimeout(()=>{
      addBotMessage("Consigo te encaixar agora porque tenho um técnico finalizando próximo.")
    },7500)

    setTimeout(()=>{
      addBotMessage("O técnico já está pronto pra sair, só preciso da confirmação de 50% pra liberar ele 👍")
    },9000)

    etapa="confirmacao"
    return
  }



  /* CONFIRMAÇÃO */

  if(etapa==="confirmacao"){

    const msg = texto.toLowerCase()

    if(msg.includes("sim") || msg.includes("ok") || msg.includes("quero")){

      mostrarPix(cliente.valor)

      setTimeout(()=>{
        addBotMessage("Assim que enviar o comprovante, já libero o técnico 👍")
      },2000)

      etapa="aguardando_pagamento"
      return
    }

    addBotMessage("Posso já liberar o técnico pra ir até você agora?")
    return
  }

}
