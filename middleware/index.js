import net from "net";
import split from "split";
import { v4 as uuidv4 } from "uuid";
import { DNS_ADDRESS, DNS_PORT } from "./config.js";

export default class Connection {
  // private readonly address;
  // private readonly client;
  promises = {}; // [id: {resolve: (), reject: ()}]
  address;
  client;
  alive = true;

  constructor(address, client, keepAlive, keepAliveInterval) {
    this.address = address;
    this.client = client;
    keepAlive ? this.initKeepAlive(keepAliveInterval) : null;
    this.initClientEvents();
  }

  // Returns a promise for connection
  static async create(keepAlive = true, keepAliveInterval = 10) {
    const [resolve, reject, promise] = createPromise();

    const client = new net.Socket();

    client.connect(DNS_PORT, DNS_ADDRESS, () => {
      const { address, port } = client.address();
      if (!address || !port) {
        throw new Error(`${address}:${port} is not a valid address.`);
      }
      const fullAddress = `${address}:${port}`;
      const connection = new Connection(
        fullAddress,
        client,
        keepAlive,
        keepAliveInterval
      );
      console.log("[MIDDLEWARE] INFO: connected on address: " + fullAddress);
      resolve(connection);
    });

    return promise;
  }

  initClientEvents() {
    const stream = this.client.pipe(split());

    stream.on("data", (res) => {
      //   console.log("[MIDDLEWARE] INFO: received - " + res);
      const response = JSON.parse(res);
      Object.keys(this.promises).forEach((requestId) => {
        if (requestId === response.id) {
          console.log("[MIDDLEWARE] INFO: of request: - " + requestId);
          this.promises[requestId].resolve(
            response.data || response.message
          );
        }
      });
    });

    this.client.on("error", (error) => {
      // TODO: testar para confirmar lógica
      if (error.code === "ECONNRESET") {
        console.log("[MIDDLEWARE] ERROR: DNS Server unavailable");
        this.client.destroy();
      } else {
        console.log("[MIDDLEWARE] ERROR: " + error.message);
        this.client.destroy();
      }
    });

    this.client.on("close", () => {
      console.log("[MIDDLEWARE] INFO: client connection closed.");
    });
  }

  request(serviceName) {
    const dnsGetData = {
      operation: "get",
      serviceName: serviceName,
    };
    return this.send(dnsGetData);
  }

  register(serviceName) {
    const dnsRegisterData = {
      operation: "post",
      data: {
        address: this.address,
        name: serviceName,
      },
    };
    return this.send(dnsRegisterData);
  }

  remove() {
    const dnsRemoveData = {
      operation: "delete",
      serviceAddress: this.address,
    };
    return this.send(dnsRemoveData);
  }

  // private
  send(messageData) {
    const [resolve, reject, promise] = createPromise();

    if (!this.alive) {
      reject("Connection not alive");
      return promise;
    }

    try {
      // TODO: set timeout to get response [reject(error)]
      const splitter = "\n";
      const id = uuidv4();
      const message =
        JSON.stringify({
          ...messageData,
          id,
        }) + splitter;
      this.client.write(message);
      this.promises[id] = { resolve, reject };
    } catch (error) {
      console.log("[MIDDLEWARE] ERROR: ", error.message);
      this.client.destroy();
      let errorMessage = error.message;
      if (error.code === "ECONNRESET") {
        errorMessage = "DNS Server unavailable";
      }
      reject(errorMessage);
    } finally {
      return promise;
    }
  }

  // private
  initKeepAlive(timeInterval) {
    const intervalSec = timeInterval * 1000;
    const interval = setInterval(() => {
      this.send({ operation: "keepAlive" }).catch((error) => {
        console.log("[MIDDLEWARE - KEEPALIVE] ERROR: " + error);
        this.alive = false;
        this.client.destroy();
        clearInterval(interval);
      });
    }, intervalSec);
  }
}

const createPromise = () => {
  let resolver,
    rejecter = undefined;
  const promise = new Promise((resolve, reject) => {
    resolver = resolve;
    rejecter = reject;
  });
  return [resolver, rejecter, promise];
};
