// ⚠️ CONFIG
const CHAVE_PIX = "74a7af2b-d2ea-4a9d-b038-f1d286803155"

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

const tecnicoFixo = { nome: "José Michel" }

const tempos = [
  "15 a 20 minutos",
  "18 a 25 minutos",
  "20 a 30 minutos"
]

// 🔥 CONTROLE DE COMPORTAMENTO
let ultimoTempoResposta = Date.now()

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

function ehDuvida(texto){
  const t = texto.toLowerCase()
  return (
    t.includes("quanto") ||
    t.includes("valor") ||
    t.includes("preço") ||
    t.includes("demora") ||
    t.includes("tempo") ||
    t.includes("seguro") ||
    t.includes("funciona") ||
    t.includes("como") ||
    t.includes("resolve") ||
    t.includes("?")
  )
}

function hora(){
  const agora=new Date()
  return agora.getHours().toString().padStart(2,"0")+":"+agora.getMinutes().toString().padStart(2,"0")
}

function scrollChat(){
  messages.scrollTop = messages.scrollHeight
}

function mostrarDigitando(){
  const msg = document.createElement("div")
  msg.className = "msg bot typing-msg"
  msg.innerHTML = `<div class="typing"><span></span><span></span><span></span></div>`
  messages.appendChild(msg)
  scrollChat()
  return msg
}

function removerDigitando(el){
  if(el) el.remove()
}

async function addBotMessage(text){
  const digitando = mostrarDigitando()

  let base = 700

  if(window.velocidadeCliente){
    if(window.velocidadeCliente < 2000){
      base = 400
    } else if(window.velocidadeCliente > 6000){
      base = 1200
    }
  }

  const tempo = base + Math.random()*600

  await new Promise(r => setTimeout(r, tempo))

  removerDigitando(digitando)

  const msg = document.createElement("div")
  msg.className = "msg bot"
  msg.innerHTML = text + `<div class="time">${hora()}</div>`
  messages.appendChild(msg)
  scrollChat()
}

function addUserMessage(text){
  const agora = Date.now()
  const tempoResposta = agora - ultimoTempoResposta
  ultimoTempoResposta = agora

  window.velocidadeCliente = tempoResposta

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

function mostrarPix(valor){
  const metade = valor / 2
  const payload = CHAVE_PIX

  const msg=document.createElement("div")
  msg.className="msg bot"

  msg.innerHTML=`
  <div style="text-align:center">

    <div style="margin-bottom:8px;font-weight:600">
      Envio imediato via PIX
    </div>

    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${payload}" 
    style="border-radius:10px;margin-bottom:10px;">

    <div style="margin-bottom:8px;font-size:14px">
      Valor do serviço: <b>R$${valor}</b><br>
      Para deslocamento: <b>R$${metade}</b>
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

async function send(){

  const texto = input.value.trim()
  if(!texto) return

  addUserMessage(texto)
  input.value = ""

  if(ehDuvida(texto)){
    const t = texto.toLowerCase()

    if(t.includes("quanto") || t.includes("valor") || t.includes("preço")){
      addBotMessage(`No seu caso, o valor fica em R$${cliente.valor} 👍`)

      setTimeout(()=>{
        addBotMessage(`Para o deslocamento, é R$${cliente.valor/2}`)
      },1200)
    }else{
      const resposta = await respostaIA(texto)
      addBotMessage(resposta)
    }

    return
  }

  if(etapa==="inicio"){

    cliente.problema = texto
    cliente.valor = definirValor(texto)

    // 🔥 ORDEM CORRETA (AUTORIDADE + APRESENTAÇÃO)
    addBotMessage("Atendimento Chaveiro 24h 🔐\nMais de 5 anos atendendo São Paulo\nTécnicos próximos da sua região\n\nOlá 👋 Sou a Thais da central.")

    // 🔥 EXPLICAÇÃO ANTES
    setTimeout(()=>{
      addBotMessage("Isso acontece bastante, mas fica tranquilo que a gente resolve sem danificar 👍")
    },1200)

    // 🔥 DEPOIS ENDEREÇO
    setTimeout(()=>{
      addBotMessage("Me passa seu endereço completo (rua, número e bairro)")
    },2500)

    etapa="endereco"
    return
  }

  if(etapa==="endereco"){
    cliente.endereco = texto

    if(texto.includes("-")){
      cliente.bairro = texto.split("-")[1].trim()
    } else {
      cliente.bairro = "sua região"
    }

    addBotMessage("Perfeito 👍")

    setTimeout(()=>{
      addBotMessage("Qual é o seu nome?")
    },1200)

    etapa="nome"
    return
  }

  if(etapa==="nome"){
    cliente.nome = texto

    addBotMessage(`Prazer ${cliente.nome} 👍`)

    setTimeout(()=>{
      addBotMessage("Me passa seu telefone pra contato rápido 📞")
    },1200)

    etapa="telefone"
    return
  }

  if(etapa==="telefone"){
    cliente.telefone = texto

    enviarLead()

    const tempo = tempos[Math.floor(Math.random()*tempos.length)]

    addBotMessage("Só um instante que estou verificando aqui 👍")

    setTimeout(()=>{
      addBotMessage(`Já encontrei um técnico próximo do ${cliente.bairro} 👍`)
    },1500)

    setTimeout(()=>{
      addBotImage(`✔ Técnico disponível<br><br>Nome: ${tecnicoFixo.nome}<br>Chegada: ${tempo}`)
    },3000)

    setTimeout(()=>{
      addBotMessage("Posso reservar agora pra ele ir até você?")
    },4200)

    etapa="confirmacao"
    return
  }

  if(etapa==="confirmacao"){
    const msg = texto.toLowerCase()

    if(msg.includes("sim") || msg.includes("ok") || msg.includes("quero")){

      addBotMessage("Perfeito 👍 já vou garantir ele pra você")

      setTimeout(()=>{
        addBotMessage("O restante é pago somente após o serviço, pode ficar tranquilo 👍")
      },1500)

      setTimeout(()=>{
        mostrarPix(cliente.valor)
      },3000)

      setTimeout(()=>{
        addBotMessage("Me envia o comprovante que já libero o técnico imediatamente 👍")
      },4500)

      setTimeout(()=>{
        addBotMessage("Estou segurando o técnico aqui pra você, só aguardando o envio 🙏")
      },15000)

      setTimeout(()=>{
        addBotMessage("Conseguiu fazer o envio? Ele ainda está disponível 👍")
      },30000)

      etapa="aguardando_pagamento"
      return
    }

    addBotMessage("Posso reservar para o técnico ir até você?")
    return
  }
}

input.addEventListener("keydown",function(e){
  if(e.key==="Enter"){
    e.preventDefault()
    send()
  }
})
