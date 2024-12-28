'use client'
import { useState, useEffect } from "react";
import { socket } from "../../socket";

export default function Atlas() {

    const [guessed, setGuessed] = useState(["america", "oman", "new zealand p"])
    const activeUsers = ["person1"]
    const [guess, setGuess] = useState("")
    const [warning, setWarning] = useState("")
    const [isConnected, setIsConnected] = useState(false);
    const [transport, setTransport] = useState("N/A");
    const [lobbyInfo, setLobbyInfo] = useState([])

    const lobbyCode = "123"

    //init connection and cleanup for socket
    useEffect(() => {
        if (socket.connected) {
            onConnect();
        }

        function onConnect() {
            setIsConnected(true);
            setTransport(socket.io.engine.transport.name);

            socket.io.engine.on("upgrade", (transport) => {
                setTransport(transport.name);
            });
        }

        function onDisconnect() {
            setIsConnected(false);
            setTransport("N/A");
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on(`lobbyInfo`, (e) => { setLobbyInfo(e), console.log(e) })
        socket.on(`invalidName`, () => {alert("THIS NAME ALREADY EXISTS")})

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            // socket.disconnect()
        };
    }, []);

    const connectToLobby = (lobbyCode: string, playerName: String) => {
        socket.emit("joinLobby", lobbyCode, playerName)
    }

    return (
        <div>
            <p>Players:</p>
            {lobbyInfo?.map(player => {
                return <div>{player}</div>
            })}
            <br></br>
            <p>Guesses:</p>
            {guessed.map(guess => <div>{guess}</div>)}
            <br></br>
            {"> enter player name:"}
            <input
                style={{ 'padding': '3% 0% 3% 0%', 'border': 'none', 'background': 'transparent' }}
                value={guess}
                onChange={(event) => setGuess(event.target.value)}
            />

            <div>
                <p>Status: {isConnected ? "connected" : "disconnected"}</p>
                <p>Transport: {transport}</p>
                <p>Lobby Code: {lobbyCode}</p>
            </div>

            <button onClick={() => { connectToLobby(lobbyCode, guess) }}>Connect to lobby</button>
        </div>
    )
}