const { Server, Socket } = require("net");

const port = 3000;
const host = "0.0.0.0";
const to_PROSA = {
  host: "localhost",
  port: 8000,
};
let socketMovistar: any;

const server = new Server();

server.on("connection", (socket: any) => {
  console.log(
    `New connection from ${socket.remoteAddress} : ${socket.remotePort}`
  );
  socket.setEncoding("utf8");
  socket.on("data", (message: string) => {
    console.log(message);
  });
  socket.on("close", () => {
    console.log(`Comunicacion finalizada con RCS`);
  });
  // Don't forget to catch error, for your own sake.
  socket.on("error", function (err: Error) {
    console.log(`Error: ${err}`);
  });
});

function connectMovistar() {
  socketMovistar = new Socket();
  socketMovistar.connect(to_PROSA);
  socketMovistar.setEncoding("utf8");
  socketMovistar.on("data", async (message: string) => {
    console.log(message);
  });
  socketMovistar.on("close", () => {
    console.log(`Comunicacion con MOVISTAR finalizada`);
  });
  socketMovistar.on("error", (err: Error): void => {
    console.log(err);
  });
}
server.listen({ port, host }, async () => {
  console.log(`Server on port: ${server.address().port}`);
  connectMovistar();
});
