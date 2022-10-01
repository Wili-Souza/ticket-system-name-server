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
  const stream = client.pipe(split());

  stream.on("data", (clientData) => {
    let data = {}
    try {
      console.log("data: ", clientData);
      data = JSON.parse(clientData);
    } catch (error) {
      console.log("[SERVER] ERROR: " + error.message);
    }

    let result = `Operation ${data.operation} not supported.`;
    switch (data.operation) {
      case "post":
        result = post(data.data);
        break;
      case "get":
        result = get(data.serviceName);
        break;
      case "delete":
        result = remove(data.serviceAddress);
        break;
      case "keepAlive":
        result = {status: "success"};
        break;
      default:
        break;
    }
    const resultData = JSON.stringify({
      ...result, id: data.id
    }) + "\n"
    client.write(resultData);
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
    return {
      status: "success",
      message: "Service successfully registered."
    };
  } else {
    return {
      status: "error",
      message: "Address already registered for another service."
    };
  }
};

const get = (data) => {
  const address = getService(data);
  if (address) {
    return {
      status: "success",
      data: address
    };
  } else {
    return {
      status: "error",
      data: "Service unavailable, try again later."
    };
  }
};

const remove = (data) => {
  const removed = deleteService(data);
  if (removed) {
    return {
      status: "success",
      data: "Service removed from DNS database."
    };
  } else {
    return {
      status: "success",
      data: "A service with this address does not exist in the database."
    };
  }
};

export default server;
