// package HTTP de Node
const http = require('http');

// importation de l'application
const app = require('./app');

// fonction qui renvoie un port valide qu'il soit fourni sous la forme d'un numéro ou d'une chaîne
const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) { return val; }
  if (port >= 0) { return port; }

  return false;
};

// on définit le port qui sera utilisé sinon on utilisera celui que l'environnement nous donnera
const port = normalizePort(process.env.PORT || '3000');

// on applique le port à l'application
app.set('port', port);

// fonction qui recherche les différentes erreurs et les gère de manière appropriée
const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

// méthode serveur du package HTTP appelé à chaque requête et réponse du serveur
const server = http.createServer(app);

// écouteur d'évènements est également consignant le port ou le canal nommé sur lequel le serveur s'exécute dans la console
server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

server.listen(port);
