
import { socket } from "@/socket";
import { LobbyState, LobbyHolder, GameState, PlayerList } from "./types";

// Return type for Joining Lobby
export enum JoinLobbyStatus {
    NameAlreadyExists = -1,
    InvalidName = -2,
    Error = -3,

    Success = 1
}

export const getLobby = (lobbyCode: string, lobbies: LobbyHolder): LobbyState => {

    const initLobby: LobbyState = {
        playerList: new PlayerList(),
        lobbyCode: lobbyCode,
        gameState: GameState.Lobby,
        guesses: []
    }

    let lobby = lobbies[lobbyCode];

    if (!lobby) {
        lobby = initLobby
        lobbies[lobbyCode] = lobby
    }

    return lobby;
}

export const joinLobby = (lobby: LobbyState, playerName: string, socketId: string): JoinLobbyStatus => {
    if (lobby.playerList.includes(playerName)) {
        return JoinLobbyStatus.NameAlreadyExists
    }

    addPlayer(lobby, playerName, socketId)
    return JoinLobbyStatus.Success
}

export const addPlayer = (lobby: LobbyState, playerName: string, socketId: string) => {
    lobby.playerList.addPlayer(playerName, socketId)
}