import { Server } from "socket.io";
import { GameState, LobbyHolder, LobbyStateFanOutEvent } from "./types";
import { startGame, nextPlayer, endGame, validateGuess, sendLobbyState } from "./AtlasAgent_CoreFunction";
import { getLobby, joinLobby, JoinLobbyStatus } from "./LobbyManager";
import ActiveGame from "@/app/components/activeGame";

const lobbies: LobbyHolder = {};

// given a socketId, tell it what lobby it belongs to
const lobbyCode_Lookup: {[socketId: string]: string} = {}

export const AtlasAgent = (io: Server) => {
  io.of("/atlas").on("connection", (socket) => {
    console.log(`a user connected to ${socket.nsp.name}`);

    socket.on("reconnect_attempt", () => {
      console.log("Attempting to reconnect...");
    });

    socket.on("disconnect", (reason) => {
      console.log(`a user disconnected from ${socket.nsp.name}`, reason);
    });

    socket.on("join", (lobbyCode: string) => {
      socket.join(lobbyCode);
      const lobby = getLobby(lobbyCode, lobbies)
      sendLobbyState(io, lobby);
    })

    socket.on("joinLobby", (lobbyCode: string, playerName: string) => {

      const lobby = getLobby(lobbyCode, lobbies)

      // safety check here if game already started, can spectate
      if (lobby.gameState != GameState.Lobby) {
        sendLobbyState(io, lobby);
        return
      }

      switch (joinLobby(lobby, playerName, socket.id)) {
        case JoinLobbyStatus.InvalidName: {
          socket.emit("invalidName")
          break
        } case JoinLobbyStatus.Success: {
          // Tell current user they've joined
          socket.emit("joinSuccess");
          lobbyCode_Lookup[socket.id] = lobbyCode
          //Update All Users with new Lobby State
          sendLobbyState(io, lobby);
        }
      }

      console.log(lobbies)
      console.log(lobby.playerList.serialize());

    });

    socket.on("startGame", (lobbyCode: string) => {
      //there should be a lobby here, if not then some error message back to client

      const lobby = getLobby(lobbyCode, lobbies)

      // If game already started don't want to start it twice
      if (lobby.gameState == GameState.Active) {
        return
      }

      //start the game
      startGame(io, lobby)

      // maybe a loop that checks last updated timestamp of lobby... and its been more than x seconds, proceed
    })

    // see now the client manages which lobby its connected to
    // should instead be the backend have a list of lobbyCode lookup by socketId
    // can probably do that tbh

    socket.on("submitGuess", (guess) => {

      console.log("GUESSED:", guess)

      // i mean this probably shouldn't ever trigger? 
      // oh but you can't think like, what if people are out of sync
      const lobbyCode = lobbyCode_Lookup[socket.id]
      if (!lobbyCode) {
        return
      }

      const lobby = getLobby(lobbyCode, lobbies)
      if (lobby.playerList.activePlayer?.socketId != socket.id) {
        sendLobbyState(io, lobby)
        return
      } 

      // If game not running, this shouldn't be executed
      if (lobby.gameState != GameState.Active) {
        return
      }

      if (validateGuess(io, lobby, guess)) {
        lobby.guesses.push(guess)
        nextPlayer(io, lobby)
      }

    })
  });
};

// notes:
// probably don't want to be doing this off the user submitted lobby code right
// maintain a server side list of each socket and what lobby they have joined
// if you get any invalid messages, then send the lobbystate back 
// if a user lost a message or something for example and they get out of sync