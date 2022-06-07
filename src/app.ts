import { messageFromRCES } from "./services/messageRCES";

const { Server } = require("net"),
  server = new Server(),
  TIEMPO_CONEXION_RCES = 55000; // Tiempo (milisegundos) limite para conexion con socket RCES

/**
 * Map que guarda las distintas conexiones sockets de RCES de la siguiente forma
 * key: es el id de Request de RCES (P-11 y P-37)
 * valor: conexion socket
 * rcesClients: new Map() : key(id_request) => socket connection
 */
let rcesClients = new Map();

// Configuracón del Server para distintas conexiones sockets de RCES
server.on("connection", (socket: any) => {
  console.log(
    `New connection from ${socket.remoteAddress} : ${socket.remotePort}`
  );
  socket.setEncoding("utf8"); // se configura socket para manejar cadena de caracteres en el buffer[]
  socket.on("data", async (message: string) => {
    console.log("\nMensaje de RCES sin formato: ");
    console.log(message);
    let id_request = await messageFromRCES(message, socket.remoteAddress);
    rcesClients.set(id_request, socket);
  });
  socket.on("close", () => {
    for (let client of rcesClients.keys()) {
      if (socket == rcesClients.get(client)) {
        rcesClients.delete(client);
      }
    }
    console.log(`\nComunicacion finalizada con RCS`);
  });
  socket.on("error", function (err: Error) {
    console.log(`Error: ${err}`);
  });
  socket.setTimeout(TIEMPO_CONEXION_RCES);
  socket.on("timeout", () => {
    console.log("Connexion socket con RCES timeout");
    socket.end();
  });
});

export { rcesClients, server };
