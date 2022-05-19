/**
 * Servidor Cliente de prueba para simular la comunicacion con RCS
 */

var net = require("net");
var port_PIDEAKY = 3000;
var host = "localhost";

var socket = new net.Socket(); // se crea socket de cliente

function error() {
  console.log(`SIN servidor en el puerto : ${port_PIDEAKY} de host: ${host}`);
}
function end() {
  console.log("Requested an end to the TCP connection");
}

socket.setEncoding("utf8");
socket.connect({ port: port_PIDEAKY, host: host }, () => {
  socket.write("Mensaje de RCS");
});
socket.on("error", error);
socket.on("end", end);
socket.on("message", (data) => {
  console.log(data);
  socket.end();
});
