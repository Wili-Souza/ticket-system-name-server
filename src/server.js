import net from "net";
import split from "split";
import {
  postService,
  getService,
  deleteService,
  getAllServices,
} from "./services/database.js";

const SPLITTER = "\n";
const STANDBY_KEY = "Standby";

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
    let data = {};
    try {
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
      case "getAll":
        result = getAll(data.servicesNames);
        break;
      case "delete":
        result = remove(data.serviceAddress);
        break;
      default:
        break;
    }
    const resultData = JSON.stringify({
      ...result,
      id: data.id,
    });
    client.write(resultData + SPLITTER);
  });

  client.on("error", (error) => {
    client.write(`ERROR: ${error.message}`);
    client.destroy();
  });

  client.once("closed", () => {
    client.write(
      `INFO: connection closed: ${client.remoteAddress}:${client.remotePort}`
    );
  });
});

const post = (data) => {
  const registered = postService(data);
  if (registered) {
    return {
      status: "success",
      message: "Service successfully registered.",
    };
  } else {
    return {
      status: "error",
      message: "Address already registered for another service.",
    };
  }
};

const get = (data) => {
  const address = getService(data);
  if (address) {
    return {
      status: "success",
      serviceAddress: address,
    };
  }

  const standbyServiceName = data + STANDBY_KEY;
  const standbyAddress = getService(standbyServiceName);
  if (standbyAddress) {
    return {
      status: "success",
      serviceAddress: standbyAddress,
    };
  }

  return {
    status: "error",
    message:
      "Neither Service nor Standby Service are available in the moment, try again later.",
  };
};

const getAll = (data) => {
  const results = getAllServices(data);
  if (results) {
    return {
      status: "success",
      serviceAddress: results,
    };
  }

  return {
    status: "error",
    message: "Internal Error, try again later.",
  };
};

const remove = (data) => {
  const removed = deleteService(data);
  if (removed) {
    return {
      status: "success",
      message: "Service removed from DNS database.",
    };
  } else {
    return {
      status: "error",
      message: "A service with this address does not exist in the database.",
    };
  }
};

export default server;
