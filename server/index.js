//PostgreSQL Sequelize Postico Database\\
const express = require("express");
const app = express();
const chalk = require("chalk");
const models = require("./models");
const path = require("path");
const apiRoutes = express.Router();

const socketio = require('socket.io')
const http = require('http')
const server = http.createServer(app)
const io = socketio(server)

 //-----------------------------------------------------------------------

models.db.authenticate().then(() => {
  console.log("Connected to the PostGres database");
});

const PORT = process.env.PORT || 5000;

const init = async () => {
  await
  // models.db.sync() // Pass in {force: true} to drop all tables then recreates them based on our JS definitions
  models.db.sync({force: true});
  server.listen(PORT, () => {
    console.log(chalk.yellow(`Codenames server is listening on port ${PORT}!`));
  });
};

init()

io.on('connection', socket => {
    console.log('Socket connection successful.')
    socket.on('joinRoom', (roomName) => {
      socket.join(roomName);
      console.log('Someone joined the game.')
  })

  socket.on('disconnect', () => {
    console.log('Disconnected from Socket.')
  });
})

//------------------------------------------------------------------------

app.use(express.static(path.join(__dirname, "./public"))); //serving up static files (e.g. css files)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//CORS ERROR FIX?
//LEARN: https://medium.com/@dtkatz/3-ways-to-fix-the-cors-error-and-how-access-control-allow-origin-works-d97d55946d9
//IMPLEMENTED THIS SOLUTION: https://stackoverflow.com/questions/51231699/access-control-allow-origin-header-in-the-response-must-not-be-the-wildcard

app.use( (req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
  );
  if ("OPTIONS" === req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use("/api", apiRoutes);

apiRoutes.use('/games', require('./routes/gamesRoutes'));

app.get('/', function (req, res, next) {
  res.redirect('/');
});

app.use((req, res, next) => {
  res.status(404).send("404 Not found");
});

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send(`
  <h1>Yay our 500 Server error is: ${err}</h1>
`)
})



//Express Router--------------------------END-----------------------------


//^PostgreSQL Sequelize Postico Database^\\

module.exports = app;
