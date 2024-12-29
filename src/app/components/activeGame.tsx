import React, { useEffect, useState } from "react"
import { Socket } from "socket.io-client"
import { LobbyStateFanOutEvent } from "../../../backend/types"

interface Props {
    socket: Socket,
    lobbyState: LobbyStateFanOutEvent,
    playerName: string
}

export default function ActiveGame(props: Props) {

    const { socket, lobbyState, playerName } = props

    useEffect(() => {
        // socket listeners
    }, [])

    const Guesser = () => {

        const submitGuess = (guess: string) => {
            // see technically if another client also sent a guess b/c it was out of sync it would mess this up
            // so the backend needs to keep a record of players, and sockets, does it by socket_id
            socket.emit("submitGuess", guess)
        }

        const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') {
                submitGuess(guess)
            }
        }

        const [guess, setGuess] = useState("")

        if (playerName == lobbyState.activePlayer) {
            return (
                <div>
                    <input
                        value={guess}
                        onChange={(e) => { setGuess(e.target.value) }}
                        onKeyUp={(e) => handleKeyPress(e)}
                    />
                    <button onClick={() => { submitGuess(guess) }}>Submit Guess</button>
                </div>
            )
        } else {
            return ("")
        }
    }

    const Guesses = () => {
        return lobbyState.guesses.reverse().map((guess) => <p>{guess}</p>)
    }

    return (
        <React.Fragment>
            <p>Name: {playerName}</p>
            <Guesser />
            <Guesses />
        </React.Fragment>
    )
}