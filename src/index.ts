import { server } from "./app";
import { connectMovistar } from "./services/connectMovistar";
import { loopEcho, loopReverses } from "./services/loops";

const port = 3000,
  host = "0.0.0.0",
  TIEMPO_LOOP_REVERSE = 30000, // Tiempo (milisegundos) para que el sistema busque y envie reversos
  TIEMPO_LOOP_ECHO = 60000; // Tiempo (milisegundos) para que el sistema envie echo test 0800

// Start Server
server.listen({ port, host }, async () => {
  console.log(`Server on port: ${server.address().port}`);
  setInterval(loopReverses, TIEMPO_LOOP_REVERSE);
  setInterval(loopEcho, TIEMPO_LOOP_ECHO);
  connectMovistar();
});
