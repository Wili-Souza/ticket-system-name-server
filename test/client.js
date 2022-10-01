import Connection from "../middleware/index.js";

const connection = await Connection.create();

connection.register("testService")
  .then((data) => {
    console.log(`[CLIENT] INFO: REGISTERED - ${data}`);
  })
  .catch((error) => {
    console.log(`[CLIENT] ERROR: NOT REGISTERED - ${error}`);
  });
  
connection.request("testService")
  .then((data) => {
    console.log(`[CLIENT] INFO: GOT - ${data}`);
  })
  .catch((error) => {
    console.log(`[CLIENT] ERROR: DID NOT GET - ${error}`);
  });

connection.remove()
  .then((data) => {
    console.log(`[CLIENT] INFO: REMOVED - ${data}`);
  })
  .catch((error) => {
    console.log(`[CLIENT] ERROR: DID NOT REMOVE - ${error}`);
  });



// import net from "net";

// const DNS_ADDRESS = "192.168.1.9";
// const DNS_PORT = 3000;

// const client = new net.Socket();

// client.connect(DNS_PORT, DNS_ADDRESS, () => {
//   console.log("[TEST] INFO: connected to DNS");

//   const address = `${client.address().address}:${client.address().port}`;

//   //   TEST: add
//   const dnsRegisterData = JSON.stringify({
//     operation: "post",
//     data: {
//       address: address,
//       name: "testService",
//     },
//   });
//   client.write(dnsRegisterData + "\n");

//   //   TEST: get
//   const dnsGetData = JSON.stringify({
//     operation: "get",
//     serviceName: "testService",
//   });
//   client.write(dnsGetData + "\n");

//   //   TEST: delete
//   const dnsDeleteData = JSON.stringify({
//     operation: "delete",
//     serviceAddress: address,
//   });
//   client.write(dnsDeleteData + "\n");
// });

// client.on("data", (data) => {
//   console.log("[TEST] INFO: received - " + data);
// });

// client.on("error", (error) => {
//   // TODO: testar para confirmar lógica
//   if (error.code === "ECONNRESET") {
//     console.log("[TEST] ERROR: DNS Server unavailable");
//     client.destroy();
//   } else {
//     console.log("[TEST] ERROR: " + error.message);
//     client.destroy();
//   }
// });

// client.on("close", () => {
//   // TODO: testar para confirmar lógica
//   console.log("[TEST] INFO: client connection closed.");
// });
