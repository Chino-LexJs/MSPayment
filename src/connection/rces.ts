/**
 * Conexiones
 * @module Connections
 */

/**
 * Map que guarda las distintas conexiones sockets de RCES de la siguiente forma
 * key: es el id de Request de RCES (P-11 y P-37)
 * valor: conexion socket
 * rcesClients: new Map() : key(id_request) => socket connection
 */
let rcesClients = new Map();

function saveConnection(id_request: number, socket: any) {
  rcesClients.set(id_request, socket);
}

function closeConnection(socket: any) {
  for (let client of rcesClients.keys()) {
    if (socket == rcesClients.get(client)) {
      rcesClients.delete(client);
    }
  }
}

function findConnection(id_request: number): boolean {
  return rcesClients.has(id_request);
}

function sendMessageConnection(id_request: number, message: string) {
  let client = rcesClients.get(id_request);
  client.write(message, "utf8");
  rcesClients.delete(id_request);
  client.end();
}

export {
  saveConnection,
  closeConnection,
  findConnection,
  sendMessageConnection,
  rcesClients,
};
