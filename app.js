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



/* ENVIA LEAD */
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



function hora(){
  const agora=new Date()
  return agora.getHours().toString().padStart(2,"0")+":"+agora.getMinutes().toString().padStart(2,"0")
}

function scrollChat(){
  messages.scrollTop = messages.scrollHeight
}



/* 🔥 DIGITANDO (NOVO) */
function mostrarDigitando(){
  const msg = document.createElement("div")
  msg.className = "msg bot typing-msg"
  msg.innerHTML = `
    <div class="typing">
      <span></span><span></span><span></span>
    </div>
  `
  messages.appendChild(msg)
  scrollChat()
  return msg
}

function removerDigitando(el){
  if(el) el.remove()
}



/* 🔥 BOT COM DELAY (ALTERADO) */
async function addBotMessage(text){

  const digitando = mostrarDigitando()

  const tempo = 700 + Math.random()*900

  await new Promise(r => setTimeout(r, tempo))

  removerDigitando(digitando)

  const msg = document.createElement("div")
  msg.className = "msg bot"
  msg.innerHTML = text + `<div class="time">${hora()}</div>`
  messages.appendChild(msg)
  scrollChat()
}



/* MENSAGENS */
function addUserMessage(text){
  const msg = document.createElement("div")
  msg.className = "msg user"
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



  if(etapa==="inicio"){

    cliente.problema = texto
    cliente.valor = definirValor(texto)

    const resposta = await respostaIA(texto)
    addBotMessage(resposta)

    setTimeout(()=>{
      addBotMessage("Só um instante que já vou verificar aqui 👍")
    },800)

    setTimeout(()=>{
      addBotMessage("Me passa seu endereço completo (rua, número e bairro)")
    },2000)

    etapa="endereco"
    return
  }



  if(etapa==="endereco"){

    if(!texto.match(/\d+/) || texto.split(" ").length < 3){
      addBotMessage("Preciso da rua, número e bairro pra localizar o técnico mais próximo com precisão 👍")
      return
    }

    cliente.endereco = texto

    setTimeout(()=>{
      addBotMessage("Perfeito 👍")
    },800)

    setTimeout(()=>{
      addBotMessage("Qual é o seu nome?")
    },1600)

    etapa="nome"
    return
  }



  if(etapa==="nome"){

    cliente.nome = texto

    setTimeout(()=>{
      addBotMessage(`Prazer ${cliente.nome} 👍`)
    },800)

    setTimeout(()=>{
      addBotMessage("Me passa seu telefone pra contato rápido 📞")
    },1600)

    etapa="telefone"
    return
  }



  if(etapa==="telefone"){

    cliente.telefone = texto

    enviarLead()

    addBotMessage("Só um instante que estou verificando aqui 👍")

    setTimeout(()=>{
      addBotMessage("Vi um técnico atendendo próximo da sua região")
    },2000)

    setTimeout(()=>{
      addBotMessage("Já estou puxando a disponibilidade dele")
    },4000)

    setTimeout(()=>{
      addBotMessage("Consegui 👍")
    },6000)

    setTimeout(()=>{
      addBotImage(`✔ Técnico disponível<br><br>Nome: ${tecnicoFixo.nome}`)
    },25000)

    setTimeout(()=>{
      addBotMessage("Posso reservar agora? Tenho ele disponível nesse momento 👍")
    },26000)

    etapa="confirmacao"
    return
  }



  if(etapa==="confirmacao"){

    const msg = texto.toLowerCase()

    if(msg.includes("sim") || msg.includes("ok") || msg.includes("quero")){

      addBotMessage("Perfeito 👍 já vou garantir ele pra você")

      setTimeout(()=>{
        addBotMessage("Como é atendimento imediato, a agenda é por ordem de confirmação 👍")
      },1500)

      setTimeout(()=>{
        addBotMessage("É feito um valor de 50% referente ao deslocamento")
      },3000)

      setTimeout(()=>{
        addBotMessage("E esse valor já é abatido do total depois 👍")
      },4500)

      setTimeout(()=>{
        mostrarPix(cliente.valor)
      },6000)

      setTimeout(()=>{
        addBotMessage("Assim que me enviar o comprovante, já libero ele imediatamente pra sua rota 👍")
      },8000)

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
