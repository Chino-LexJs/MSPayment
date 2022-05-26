/**
 * Servidor Cliente de prueba para simular la comunicacion con RCS
 */

var net = require("net");
var port_PIDEAKY = 3000;
var host = "localhost";
var port = 8040;

var socket = new net.Socket(); // se crea socket de cliente

function error() {
  console.log(`SIN servidor en el puerto : ${port_PIDEAKY} de host: ${host}`);
}
function end() {
  console.log("Requested an end to the TCP connection");
}

socket.setEncoding("utf8");
socket.connect({ port: port_PIDEAKY, host: host }, () => {
  socket.write(
    ":010000010000000000                         0002022051413452247761546956500000000005000A0000!"
  );
  socket.on("data", (data) => {
    console.log("Mensaje recibido:");
    console.log(data);
    socket.end();
  });
  socket.on("error", error);
  socket.on("end", end);
});
