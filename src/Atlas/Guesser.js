import { useState } from "react"

function Guesser({ guessed, validateAndAppend }) {

    const vertCenter =
    {
        // 'margin': '0',
        // 'position': 'absolute',
        // 'top': '60%',
        // 'textAlign': 'center',
        // 'msTransform': 'translateY(-50%)',
        // 'transform': 'translateY(-50%)',
        // 'width': '100vw'
    }

    const inputBox = {
        'fontSize': '150%',
        'opacity': '65%',
        'paddingLeft': '14px',
        'paddingRight': '14px',
        'paddingTop': '6px',
        'paddingBottom': '6px',
        'marginTop': '20px',
        // 'background-color': "transparent",
        'border': 'none'
    }

    const [currentGuess, setCurrentGuess] = useState("a")

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            const cleaned = currentGuess.trim()
            console.log(cleaned)
            if (cleaned.length > 0) {
                const validity = validateAndAppend(cleaned)
                // console.log(validity)
                setCurrentGuess("")
            }            
        }
    }

    // inpisration for input: https://codesandbox.io/s/yqlz84rnyv?from-embed 
    return (
        // <div style={{fontSize: '300%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderStyle: 'solid', width: '30%'}}>
        //     word...
        // </div>
        <div style={vertCenter}>
            {/* <form onSubmit={() => {console.log(currentGuess)}}> */}
            <input style={inputBox} autoFocus={true} type="" value={currentGuess}
                onChange={e => setCurrentGuess(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            {/* <center>word...</center> */}
            {/* </form> */}
        </div>
    )
}

export default Guesser