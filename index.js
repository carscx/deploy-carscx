const express = require("express");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const path = require("path");
const basicAuth = require("express-basic-auth");
const session = require("express-session");
require("dotenv").config(); // Cargar variables de entorno

const app = express();
const PORT = process.env.PORT || 5000;
const SESSION_TIMEOUT_MINUTES =
  parseInt(process.env.SESSION_TIMEOUT_MINUTES) || 5;
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  console.error(
    "Error: La variable de entorno SESSION_SECRET no está definida."
  );
  process.exit(1);
}

console.log("Variables de entorno cargadas:");
console.log("PORT:", PORT);
console.log("SESSION_TIMEOUT_MINUTES:", SESSION_TIMEOUT_MINUTES);
console.log("SESSION_SECRET:", SESSION_SECRET);

const authUsers = {};
authUsers[process.env.BASIC_AUTH_USER] = process.env.BASIC_AUTH_PASSWORD;

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: SESSION_TIMEOUT_MINUTES * 60 * 1000 } // Convertir minutos a milisegundos
  })
);

app.use(
  basicAuth({
    users: authUsers,
    challenge: true,
    unauthorizedResponse: (req) => {
      return req.auth
        ? `Credenciales para ${req.auth.user} no son válidas`
        : "No se proporcionaron credenciales";
    }
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  if (!req.session) {
    console.error("Error en la sesión");
    return res.status(500).send("Error en la sesión");
  }
  next();
});

app.post("/deploy", (req, res) => {
  console.log("Recibida solicitud para /deploy");
  exec("bash $HOME/deploy.sh", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error ejecutando el comando: ${error}`);
      return res
        .status(500)
        .send(`<pre>Error ejecutando el comando: ${error.message}</pre>`);
    }
    if (stderr) {
      console.error(`Error en el comando: ${stderr}`);
      return res.status(500).send(`<pre>Error en el comando: ${stderr}</pre>`);
    }
    console.log(`Resultado del comando: ${stdout}`);
    res.send(`<pre>Comando ejecutado con éxito:\n${stdout}</pre>`);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
