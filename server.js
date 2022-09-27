import net from "net";
import split from "split";
import { postService, getService, deleteService } from "./services/database.js";

const server = net.createServer();

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.log("ERROR: This port unavailable.");
    server.close();
    console.log("INFO: Server closed.");
  }
});

server.on("connection", (client) => {
  // TODO: split by object, not new line
  const stream = client.pipe(split());

  stream.on("data", (clientData) => {
    const data = JSON.parse(clientData);
    let resultMessage = `Operation ${data.operation} not supported.`;
    switch (data.operation) {
      case "post":
        resultMessage = post(data.data);
        break;
      case "get":
        resultMessage = get(data.serviceName);
        break;
      case "delete":
        resultMessage = remove(data.serviceAddress);
        break;
      default:
        break;
    }
    
    client.write("145.345.34.2");
    
    client.write("successo");

    client.write("145.123.23.1");
  });

  client.on("error", (error) => {
    // TODO: testar para confirmar lógica
    client.write(`ERROR: ${error.message}`);
    client.destroy();
  });

  client.once("closed", () => {
    // TODO: testar para confirmar lógica
    client.write(
      `INFO: connection closed: ${client.remoteAddress}:${client.remotePort}`
    );
  });

  console.log(
    `INFO: got new connection from ${client.remoteAddress}:${client.remotePort}`
  );
});

const post = (data) => {
  const registered = postService(data);
  if (registered) {
    return "Service successfully registered.";
  } else {
    return "Address already registered for another service.";
  }
};

const get = (data) => {
  const address = getService(data);
  if (address) {
    return address;
  } else {
    // TODO: client precisa saber se é o erro ou o address
    return "Service unavailable, try again later.";
  }
};

const remove = (data) => {
  const removed = deleteService(data);
  if (removed) {
    return "Service removed from DNS database.";
  } else {
    return "A service with this address does not exist in the database.";
  }
};

export default server;
