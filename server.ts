import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

let lobbies: { [id: string]: Set<String> } = {};

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.of("/atlas").on("connection", (socket) => {
    console.log(`a user connected to ${socket.nsp.name}`);

    socket.on("reconnect_attempt", () => {
      console.log("Attempting to reconnect...");
    });

    socket.on("disconnect", (reason) => {
      console.log(`a user disconnected from ${socket.nsp.name}`, reason);
    });

    socket.on("joinLobby", (lobbyCode: string, playerName: String) => {
      console.log("JOINED LOBBY:", lobbyCode, playerName)

      socket.join(lobbyCode);

      const lobby: Set<String> = lobbies[lobbyCode] || new Set()

      switch (lobby.has(playerName)) {
        case true: {
          socket.emit(`invalidName`)
        } 
        case false: {
          lobby.add(playerName)
          lobbies[lobbyCode] = lobby
          io.of("/atlas").to(lobbyCode).emit("lobbyInfo", Array.from(lobby))
        }
      }
      

      console.log(lobby)
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
