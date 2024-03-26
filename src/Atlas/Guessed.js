import ListGroup from 'react-bootstrap/ListGroup';

function renderCountries(countries) {
    return countries.slice(-5).map((country) => { return <ListGroup.Item>{country}</ListGroup.Item> })
}

// https://jsfiddle.net/whf5jdvq/14/ - reverse scrolling list
function Guessed({ guessed, setGuessed }) {
    const listStyle = {
        // bottom: 0,
        // position: 'absolute',
        // justify: 'center',
        // overflow: 'none',

        // justify: 'center', color: 'white', border: 'solid', maxWidth: '17%', minHeight: '15vh', padding: '25px', position: 'relative', overflow: 'hidden'
    }

    // ok so for this one im just going to set n to a predefined render of words. but if empty just render words as transparent
    // and if reach the n limit the nth word is going to be the half grey half transparent gradient to seem like its going away
    return (
        <ListGroup>
            {renderCountries(guessed)}
        </ListGroup>
    )
}

export default Guessed