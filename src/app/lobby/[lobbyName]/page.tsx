import Atlas from "../../components/atlas"

export default function GameHome({ params }: { params: { lobbyName: string } }) {
    const { lobbyName } = params;

    return (
        <div>
            <h1>Welcome to room: '{lobbyName}'</h1>
            <Atlas lobbyCode={lobbyName} />
        </div>
    );
}