import dotenv from "dotenv"
import server from "./server.js"
import ip from "ip"

dotenv.config();
const PORT = process.env.PORT;
const IP_ADDRESS = ip.address();

server.listen(PORT, () => {
  console.log(`INFO: Running name server on ${IP_ADDRESS}:${PORT}`);
});