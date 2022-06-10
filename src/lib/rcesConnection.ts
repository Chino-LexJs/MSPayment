import { closeConnection, saveConnection } from "../connection/rces";
import { saveRequest } from "../db";
import { saveMessageDataBase, unpack } from "../util";
import { MTI0200 } from "./MTI_0200";

export class RCES {
  private socket: any;
  private socketMovistar: any;
  private TIEMPO_CONEXION_RCES: number = 55000;

  constructor(socket: any) {
    this.socket = socket;
    this.socket.setEncoding("utf8"); // se configura socket para manejar cadena de caracteres en el buffer[]
    this.socket.on("data", async (message: string) => {
      console.log("\nMensaje de RCES sin formato: ");
      console.log(message);
      let id_request = await this.messageFromRCES(
        message,
        this.socket.remoteAddress
      );
      saveConnection(id_request, socket);
    });
    this.socket.on("close", () => {
      closeConnection(this.socket);
      console.log(`\nComunicacion finalizada con RCS`);
    });
    this.socket.on("error", function (err: Error) {
      console.log(`Error: ${err}`);
    });
    this.socket.setTimeout(this.TIEMPO_CONEXION_RCES); // Tiempo limite de conexión
    this.socket.on("timeout", () => {
      console.log("Connexion socket con RCES timeout");
      this.socket.end();
    });
  }

  public getSocket(): any {
    return this.socket;
  }
  public setSocketMovistar(socket: any) {
    this.socketMovistar = socket;
  }
  private async messageFromRCES(
    message: string,
    ipClient: string
  ): Promise<number> {
    let dataUnpack: { [key: string]: string } = unpack(message);
    console.log("\nMensage de RCES deslozado: ");
    console.log(dataUnpack);
    let id_request = await this.saveRequestMessage(dataUnpack, ipClient);
    this.addIdRquest(dataUnpack, id_request);
    let mti0200 = new MTI0200(dataUnpack, "0200");
    console.log("\nData elements generados por el msj 0200 de RCES:");
    console.log(mti0200.getFields());
    console.log(
      "\nMensaje 0200 en formato ISO8583 enviado a Movistar:\n",
      mti0200.getMessage()
    );
    this.socketMovistar.write(mti0200.getMessage(), "utf8");
    await saveMessageDataBase(
      mti0200.getMti(),
      mti0200.getTrancenr(),
      mti0200.getMessage()
    );
    return id_request;
  }
  private posDate(date: string): Date {
    return new Date(
      Number(date.substr(0, 4)),
      Number(date.substr(4, 2)),
      Number(date.substr(6))
    );
  }
  private posTime(date: string, time: string): Date {
    return new Date(
      Number(date.substr(0, 4)),
      Number(date.substr(4, 2)),
      Number(date.substr(6)),
      Number(time.substr(0, 2)),
      Number(time.substr(2, 2)),
      Number(time.substr(4))
    );
  }
  private async saveRequestMessage(
    dataUnpack: { [key: string]: string },
    ipClient: string
  ): Promise<any> {
    let posdate = this.posDate(dataUnpack.POS_DATE);
    let postime = this.posTime(dataUnpack.POS_DATE, dataUnpack.POS_TIME);
    let valuesRequest = {
      date_request: new Date(),
      time_request: new Date(),
      ip: ipClient,
      account_id: Number(dataUnpack.ACCOUNT_ID),
      pos_id: Number(dataUnpack.POS_ID),
      pos_name: dataUnpack.POS_NAME,
      pos_state: dataUnpack.POS_STATE,
      postimezona: Number(dataUnpack.POS_TIME_ZONE),
      posdate,
      postime,
      dnb: dataUnpack.DNB,
      amount: Number(dataUnpack.AMOUNT),
      productgroup: dataUnpack.PRODUCT_GROUP,
      product_nr: Number(dataUnpack.PRODUCT_NR),
      responsecode: Number(dataUnpack.RESPONSE_CODE),
      authorizationnr: Number(dataUnpack.AUTORIZATION_NR),
      error: 0, // HARDCODEADO
      action: Number(dataUnpack.ACTION),
    };
    let id_request = await saveRequest(
      valuesRequest.date_request,
      valuesRequest.time_request,
      valuesRequest.ip,
      valuesRequest.account_id,
      valuesRequest.pos_id,
      valuesRequest.pos_name,
      valuesRequest.pos_state,
      valuesRequest.postimezona,
      valuesRequest.posdate,
      valuesRequest.postime,
      valuesRequest.dnb,
      valuesRequest.amount,
      valuesRequest.productgroup,
      valuesRequest.product_nr,
      valuesRequest.responsecode,
      valuesRequest.authorizationnr,
      valuesRequest.error,
      valuesRequest.action
    );
    return id_request;
  }
  private addIdRquest(
    dataUnpack: { [key: string]: string },
    id_request: string
  ) {
    dataUnpack.SYSTEMS_TRANCE = id_request.toString().slice(-6); // Si el numero supera los 6 digitos P-11 solo capta hasta 6 digitos
    dataUnpack.RETRIEVAL_REFERENCE_NUMBER = id_request.toString();
  }
}
