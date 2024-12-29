import { Server } from "socket.io";
import { GameState, LobbyHolder, LobbyState, LobbyStateFanOutEvent } from "./types";

// Game Functions
export const startGame = (io: Server, lobby: LobbyState) => {

    // set up first player
    lobby.playerList.activePlayer = lobby.playerList.head

    lobby.gameState = GameState.Active

    sendLobbyState(io, lobby)
}

export const nextPlayer = (io: Server, lobby: LobbyState) => {
    const activePlayer = lobby.playerList.activePlayer
    const nextPlayer = activePlayer?.nextPlayer || lobby.playerList.head
    lobby.playerList.activePlayer = nextPlayer

    sendLobbyState(io, lobby)

    //think about edge cases later, like what if no active player, only one player so when player loses after time expires they get booted
}

export const validateGuess = (io: Server, lobby: LobbyState, guess: string): boolean => {
    const guesses = lobby.guesses

    // do validations here
    return true
}

export const endGame = (io: Server, lobby: LobbyState) => {

}

export const sendLobbyState = (io: Server, lobby: LobbyState) => {
    const lobbyStateFanOutEvent = {
        players: lobby.playerList.serialize(),
        lobbyCode: lobby.lobbyCode,
        gameState: lobby.gameState,

        //these will only be used for ActiveGames
        activePlayer: lobby.playerList.activePlayer?.name,
        // turnEnd_timestamp -> set an end timestamp, 
        // remove players from players? this will cause them to auto spectate?
        // or send a spectate command
        guesses: lobby.guesses
    }

    // console.log("Fan Out", lobbyStateFanOutEvent)
    io.of("/atlas").to(lobby.lobbyCode).emit("lobbyState", lobbyStateFanOutEvent);
}