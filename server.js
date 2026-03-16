const express = require("express")
const path = require("path")

const app = express()

app.use(express.json())

/* servir arquivos estáticos */
app.use(express.static(__dirname))

/* rota principal */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "chat.html"))
})

/* porta do render */
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Servidor rodando")
})
