const express = require("express");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/deploy", (req, res) => {
  exec("bash $HOME/deploy.sh", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error ejecutando el comando: ${error}`);
      return res
        .status(500)
        .send(`Error ejecutando el comando: ${error.message}`);
    }
    if (stderr) {
      console.error(`Error en el comando: ${stderr}`);
      return res.status(500).send(`Error en el comando: ${stderr}`);
    }
    console.log(`Resultado del comando: ${stdout}`);
    res.send(`Comando ejecutado con éxito:\n${stdout}`);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
