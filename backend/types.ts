import { serialize } from "v8"

// Server Side Representation of Lobby State
class Player {
    prevPlayer: Player | null
    nextPlayer: Player | null
    name: string

    // each player can also have their associated socket?
    socketId: string

    constructor(prev: Player | null, next: Player | null, playerName: string, socketId: string) {
        this.prevPlayer = prev
        this.nextPlayer = next
        this.name = playerName
        this.socketId = socketId
    }
}

export class PlayerList {
    head: Player | null
    tail: Player | null
    activePlayer: Player | null

    length: number

    constructor() {
        this.head = null
        this.tail = null
        this.activePlayer = null

        this.length = 0
    }

    private getPlayerRef = (playerName: string): Player | null => {
        let curr = this.head
        while (curr != null) {
            if (curr.name == playerName) {
                return curr
            }
            curr = curr.nextPlayer
        }

        return null
    }

    public addPlayer = (playerName: string, socketId: string): void => {
        const curr = new Player(this.tail, null, playerName, socketId)
        if (this.tail) {
            this.tail.nextPlayer = curr
        } else {
            this.head = curr
        }
        this.tail = curr
        this.length++
    }

    public removePlayer = (playerName: string): void => {
        const playerRef = this.getPlayerRef(playerName)

        if (playerRef) {
            const prev = playerRef.prevPlayer
            if (prev) {
                prev.nextPlayer = playerRef.nextPlayer
            }

            const next = playerRef.nextPlayer
            if (next) {
                next.prevPlayer = playerRef.prevPlayer
            }

            //update metadata
            if (this.head == playerRef) {
                this.head = playerRef.nextPlayer
            }

            if (this.tail == playerRef) {
                this.tail = playerRef.prevPlayer
            }

            this.length--

        }

    }

    public includes = (playerName: string): boolean => {
        return (this.getPlayerRef(playerName) != null)
    }

    // Converts to Compatible format for Client
    // Converts into an array of player names
    public serialize = (): string[] => {
        const playerNames: string[] = []

        let curr = this.head
        while (curr != null) {
            playerNames.push(curr.name)
            curr = curr.nextPlayer
        }

        return playerNames
    }
}

export interface LobbyState {
    playerList: PlayerList,
    lobbyCode: string,
    gameState: GameState,

    // turnEnd_timestamp -> set an end timestamp, 
    // remove players from players? this will cause them to auto spectate?
    // or send a spectate command
    guesses: String[]
}

// Type for list of Lobbies
export interface LobbyHolder {
    [id: string]: LobbyState
}

// Client Side Details and conversions
export interface LobbyStateFanOutEvent {
    players: string[],
    lobbyCode: string,
    gameState: GameState,

    //these will only be used for ActiveGames
    activePlayer: String,
    // turnEnd_timestamp -> set an end timestamp, 
    // remove players from players? this will cause them to auto spectate?
    // or send a spectate command
    guesses: String[]
}

export enum GameState {
    Error = -2, //auto increments numbers after
    Loading,
    Lobby,
    Active
}