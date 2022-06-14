import { movistar } from "../connection/movistar";
import { RCES } from "../lib/rcesConnection";

function connectRCES(socket: any) {
  console.log(
    `New connection from ${socket.remoteAddress} : ${socket.remotePort}`
  );
  let rcesConnection: RCES = new RCES(socket);
  rcesConnection.setSocketMovistar(movistar.getSocket());
}

export { connectRCES };
