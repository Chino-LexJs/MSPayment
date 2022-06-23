/**
 * Distintas funciones principales del sistema
 * @module Server
 */
import { main, server } from "./app";
/**
 * Numero de puerto del server
 * @type {number}
 */
const port: number = 3000,
  /**
   * Host del servidor
   * @type {string}
   */
  host: string = "0.0.0.0";

/**
 * Inicia el servidor
 */
server.listen({ port, host }, async () => {
  console.log(`Server on port: ${server.address().port}`);
  main();
});
