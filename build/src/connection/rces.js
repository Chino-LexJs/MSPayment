"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rcesClients = exports.sendMessageConnection = exports.findConnection = exports.closeConnection = exports.saveConnection = void 0;
/**
 * Map que guarda las distintas conexiones sockets de RCES de la siguiente forma
 * key: es el id de Request de RCES (P-11 y P-37)
 * valor: conexion socket
 * rcesClients: new Map() : key(id_request) => socket connection
 */
let rcesClients = new Map();
exports.rcesClients = rcesClients;
function saveConnection(id_request, socket) {
    rcesClients.set(id_request, socket);
}
exports.saveConnection = saveConnection;
function closeConnection(socket) {
    for (let client of rcesClients.keys()) {
        if (socket == rcesClients.get(client)) {
            rcesClients.delete(client);
        }
    }
}
exports.closeConnection = closeConnection;
function findConnection(id_request) {
    return rcesClients.has(id_request);
}
exports.findConnection = findConnection;
function sendMessageConnection(id_request, message) {
    let client = rcesClients.get(id_request);
    client.write(message, "utf8");
    rcesClients.delete(id_request);
    client.end();
}
exports.sendMessageConnection = sendMessageConnection;
