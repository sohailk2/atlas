'use client'
import { useState, useEffect, useRef, ChangeEvent } from "react";
import { socket } from "../../socket";
import Lobby from "./lobby";
import { LobbyStateFanOutEvent, GameState } from "../../../backend/types";
import ActiveGame from "./activeGame";

interface Props {
    lobbyCode: string
}

export default function Atlas(props: Props) {

    // const [guessed, setGuessed] = useState(["america", "oman", "new zealand p"])
    // const activeUsers = ["person1"]
    // const [guess, setGuess] = useState("")
    // const [warning, setWarning] = useState("")
    const [playerName, setPlayerName] = useState<string>("")


    const [isConnected, setIsConnected] = useState(false);
    const [transport, setTransport] = useState("N/A");

    const { lobbyCode } = props

    const [lobbyState, setLobbyState] = useState<LobbyStateFanOutEvent>({ 
        players: [], 
        lobbyCode: lobbyCode,
        gameState: GameState.Loading,
        activePlayer: "",
        guesses: []
    })

    const [joined, setJoined] = useState<boolean>(false)
    const inputPlayerNameRef = useRef(null)

    /** 
     * Let's write some pseudoCode, first you connect to the socket
     * After connecting to the socket, try connecting to the game lobby with a unique name
     *  if connection is successful -> listen for the on("joinSuccess") message
     *      this will allow your name to pop up on screen in the active players page 
     *      maybe the background of the page can transition colors slightly? grey to soft green when connected? or a ui element for that
     *      once ready... anyone can click start. this will send out an emit message to all users that the game has started
     *      the backend server will repeatedly send messages for current gameStatus?
     *          this object will hold current player, and each player's points values? so all state management for that is handle on the backend
     *          backend is the source of truth 
     */

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

            socket.emit("join", lobbyCode)
        }

        function onDisconnect() {
            setIsConnected(false);
            setTransport("N/A");
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        // Game Functions
        socket.on(`lobbyState`, (lobbyStateEvent) => {
            console.log(lobbyStateEvent)
            setLobbyState(lobbyStateEvent);
        })
        socket.on("joinSuccess", () => { setJoined(true) })
        socket.on(`invalidName`, () => { alert("THIS NAME ALREADY EXISTS") })

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
        };
    }, []);

    const connectToLobby = (lobbyCode: String, playerName: string) => {
        setPlayerName(playerName)
        socket.emit("joinLobby", lobbyCode, playerName)
    }

    const Diagnostics = () => (
        <div>
            <p>Status: {isConnected ? "connected" : "disconnected"}</p>
            <p>Transport: {transport}</p>
            <p>Lobby Code: {lobbyCode}</p>
            <p>Game State: {lobbyState.gameState}</p>
            <p>Lobby: {JSON.stringify(lobbyState)}</p>
        </div>
    )

    // Functional Component to Join Game
    const JoinGame = () => {

        const [localPlayerName, setLocalPlayerName] = useState<string>("")

        const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') {
                connectToLobby(lobbyCode, localPlayerName)
            }
        }

        useEffect(() => {
            inputPlayerNameRef.current?.focus()
        }, [])

        // do some switch statements here, if game active then say spectating or something?
        if (!joined && lobbyState.gameState == GameState.Lobby) {
            return (
                <>
                    <p> enter player name: <button onClick={() => { connectToLobby(lobbyCode, localPlayerName) }}>Connect to lobby</button> </p>
                    <span onClick={() => inputPlayerNameRef.current?.focus()}>{"> "}</span>
                    <input
                        style={{ 'padding': '3% 0% 3% 0%', 'border': 'none', 'background': 'transparent', 'outline': 'none' }}
                        value={localPlayerName}
                        onChange={(event) => setLocalPlayerName(event.target.value)}
                        onKeyUp={event => { handleKeyPress(event) }}
                        ref={inputPlayerNameRef}
                    />

                </>
            )
        }

        return (<></>)

    }


    const GameManager = () => {
        switch (lobbyState.gameState) {
            case GameState.Loading:
                return ("Loading...")
            case GameState.Lobby:
                return (<Lobby lobbyState={lobbyState} joined={joined} socket={socket} />)
            case GameState.Active:
                return (<ActiveGame lobbyState={lobbyState} socket={socket} playerName={playerName}/>)
        }
    }

    return (
        <div>

            <GameManager />
            <br></br>
            <JoinGame />

            <br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br>
            <Diagnostics />

        </div>
    )
}