import { Socket } from 'socket.io-client';
import { LobbyStateFanOutEvent } from "../../../backend/types"
import { useEffect } from "react"
import React from "react"

interface Props {
    lobbyState: LobbyStateFanOutEvent,
    joined: boolean,
    socket: Socket
}

export default function Lobby(props: Props) {
    const {lobbyState, joined, socket} = props

    useEffect(() => {
        // socket listeners here
    }, [])
    
    const StartGame = () => {
        if (joined) {
            return <button onClick={() => {socket.emit("startGame", lobbyState.lobbyCode)}}>Start Game</button>
        }
        return ""
    }

    return (
        <React.Fragment>
            <div>
                Players:
                {lobbyState.players?.map((player) => <p>{player}</p>)}
            </div>

            <br></br>

            <StartGame />
        </React.Fragment>
    )
}