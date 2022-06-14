import { main, server } from "./app";

const port = 3000,
  host = "0.0.0.0";

// Start Server

server.listen({ port, host }, async () => {
  console.log(`Server on port: ${server.address().port}`);
  main();
});
