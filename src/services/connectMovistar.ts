import { message0210, message0430, message0800 } from "./messagesMovistar";
const { Socket } = require("net");
const to_MOVISTAR = {
  host: "localhost",
  port: 8000,
};

let socketMovistar: any;
/**
 * Desc: Funcion que sirve para recuperar el tipo de msj ISO8583
 * Precondiciones: La trama message debe tener el mti en los primeros 4 caracteres
 * @param message Mensaje ISO 8583 de Movistar
 * @returns mti (string) type of message ej: 0200, 0210, 0430, 0800, 0810
 */
function getMti(message: string): string {
  return message.substr(0, 4);
}

/**
 * Funcion que genera conexion socket con Movistar
 */
function connectMovistar() {
  socketMovistar = new Socket();
  socketMovistar.connect(to_MOVISTAR);
  socketMovistar.setEncoding("utf8"); // se configura socket para manejar cadena de caracteres en el buffer[]
  socketMovistar.on("data", async (message: string) => {
    let mtiMessage = getMti(message);
    switch (mtiMessage) {
      case "0210":
        message0210(message);
        break;
      case "0430":
        message0430(message);
        break;
      case "0800":
        message0800(message);
      default:
        console.log("\nTipo de mensaje (MTI) no soportado por el Servidor");
        break;
    }
  });
  socketMovistar.on("close", () => {
    console.log(`\nComunicacion con MOVISTAR finalizada`);
    connectMovistar(); // Siempre debe intentar conectarse a Movistar
  });
  socketMovistar.on("error", (err: Error): void => {
    console.log(err);
  });
}

export { socketMovistar, connectMovistar };
