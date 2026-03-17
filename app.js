// ⚠️ CONFIG
const CHAVE_PIX = "11999999999"
const VALOR_SINAL = 50

const messages = document.getElementById("messages")
const input = document.getElementById("text")

let cliente = {
  endereco: "",
  bairro: "",
  telefone: "",
  nome: ""
}

let etapa = "inicio"

const tecnicoFixo = { nome: "Antonio Carlos" }

const tempos = [
  "15 a 20 minutos",
  "18 a 25 minutos",
  "20 a 30 minutos"
]



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



/* DIGITAÇÃO */
function typing(){
  const msg=document.createElement("div")
  msg.className="msg bot typing-box"
  msg.innerHTML=`<div class="typing"><span></span><span></span><span></span></div>`
  messages.appendChild(msg)
  scrollChat()
  return msg
}



/* PIX */
function mostrarPix(){

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



  /* IA PRIMEIRO */

  if(etapa==="inicio"){

    const t = typing()
    const resposta = await respostaIA(texto)

    setTimeout(()=>{
      t.remove()
      addBotMessage(resposta)
    },1000)

    setTimeout(()=>{
      addBotMessage("Já vou verificar um técnico próximo 👍 Me passa seu endereço completo (rua, número e bairro).")
    },2000)

    etapa="endereco"
    return
  }



  /* ENDEREÇO */

  if(etapa==="endereco"){

    const textoLimpo = texto.replace(/\s+/g, " ").trim()
    const partes = textoLimpo.split(" ")

    if(!textoLimpo.match(/\d+/) || partes.length < 3){
      addBotMessage("Me passa rua, número e bairro pra localizar certinho 👍")
      return
    }

    cliente.endereco = textoLimpo
    cliente.bairro = partes[partes.length - 1]

    addBotMessage(`Perfeito 👍 já identifiquei sua região (${cliente.bairro}).`)

    setTimeout(()=>{
      addBotMessage("Tem um técnico finalizando um atendimento bem próximo de você.")
    },1200)

    setTimeout(()=>{
      addBotMessage("Qual é o seu nome?")
    },2500)

    etapa="nome"
    return
  }



  /* NOME */

  if(etapa==="nome"){

    cliente.nome = texto.trim()

    addBotMessage(`Prazer ${cliente.nome} 😊`)

    setTimeout(()=>{
      addBotMessage("Me passa seu telefone pra contato rápido 📞")
    },1200)

    etapa="telefone"
    return
  }



  /* TELEFONE */

  if(etapa==="telefone"){

    cliente.telefone = texto.trim()

    const tempo = tempos[Math.floor(Math.random()*tempos.length)]

    addBotMessage("Já confirmei um técnico próximo da sua região.")

    setTimeout(()=>{
      addBotImage(`✔ Técnico já a caminho<br><br>
      Nome: ${tecnicoFixo.nome}`)
    },1500)

    setTimeout(()=>{
      addBotMessage(`Ele chega em aproximadamente ${tempo}.`)
    },3000)

    setTimeout(()=>{
      addBotMessage("Pra garantir o envio imediato, preciso só confirmar 👍")
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

      addBotMessage("Perfeito 👍 já estou liberando o técnico pra você.")

      setTimeout(()=>{
        addBotMessage("Ele já está finalizando outro atendimento e entra na sua rota.")
      },1200)

      setTimeout(()=>{
        addBotMessage(`Para garantir o deslocamento, é feito um sinal de R$${VALOR_SINAL}.`)
      },2500)

      setTimeout(()=>{
        mostrarPix()
      },4000)

      setTimeout(()=>{
        addBotMessage("Assim que enviar o comprovante, libero imediatamente 👍")
      },5500)

      etapa="aguardando_pagamento"
      return
    }

    if(msg.includes("não") || msg.includes("nao")){
      addBotMessage("Tranquilo 👍 qualquer coisa estou por aqui.")
      etapa="finalizado"
      return
    }

    addBotMessage("Posso confirmar o envio do técnico pra você agora?")
    return
  }



  /* PAGAMENTO */

  if(etapa==="aguardando_pagamento"){
    addBotMessage("Assim que você enviar o comprovante, já libero o técnico 👍")
    return
  }

}



/* ENTER */
input.addEventListener("keypress",function(e){
  if(e.key==="Enter") send()
})
