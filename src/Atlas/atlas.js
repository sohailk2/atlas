import { useState } from "react";
import Guessed from "./Guessed";
import Guesser from "./Guesser";
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';
import ListGroup from 'react-bootstrap/ListGroup';
import OpenAI from "openai";
import Card from 'react-bootstrap/Card';


function Atlas() {

    const [guessed, setGuessed] = useState(["america", "oman", "new zealand p"])
    const [warning, setWarning] = useState("")

    // this function will make sure we're only adding valid things to the guessed list
    // here is where all the checking will happen
    const validateAndAppend = async (guess) => {

        const validator = async (guess) => {
            // rules for validation:
            // last letter of last guess has to match the first letter of current guess
            // has to not be in the list
            // has to not have been used before

            const letterCheck = (guess) => {
                if (guessed.length !== 0) {
                    var lastLetter = guessed.slice(-1)[0].slice(-1)
                    var firstLetter = guess.charAt(0)

                    if (firstLetter === lastLetter) {
                        return { valid: true, message: "" }
                    }

                    return { valid: false, message: `Guess should start with a ${lastLetter}` };
                }

                return { valid: true, message: "" };
            }

            const validLocation = async (guess) => {
                //first check if its a country or a continent
                //should i just use gpt?? i wonder how much tokens are
                const openai = new OpenAI({
                    // apiKey: process.env.OPENAI_API_KEY,
                    apiKey: "",
                    dangerouslyAllowBrowser: true
                });

                const response = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            "role": "system",
                            // "content": "You are an assistant tasked with verifying whether a place is a valid location in the real world. Valid locations include countries, continents, significant administrative regions, and recognized geographic entities. Note that landmarks, cities that are not capital cities, and specific points of interest like airports or famous buildings are not considered valid locations for this task. Your task is to evaluate the input and determine if it represents a valid location based on the criteria mentioned above. Your response must be in JSON format, structured as follows: { \"valid\": true, \"message\": \"Reason why it is a valid location\" }. The \"valid\" field should be true if the input represents a valid location and false otherwise. The \"message\" field should provide a brief explanation or reason for why the input is considered valid or invalid as a location. Keep in mind the following guidelines: Valid locations include countries, continents, and significant administrative regions/states/provinces known on a global scale. Invalid locations include specific cities (unless they are capital cities), landmarks, natural features (unless they are major geographic entities), and man-made structures like airports or famous buildings. Please ensure your response adheres to these guidelines and provides accurate validation for a wide range of location inputs."                        
                            "content": "You are an assistant tasked with validating whether a place is a real location and meets specific criteria. Valid locations include countries, continents, recognized capital cities (such as Amsterdam for the Netherlands), and significant administrative regions or provinces that exist in the real world. Your task is to evaluate the input and determine if it represents a valid location based on the criteria mentioned above. Note that landmarks, natural features, airports, famous buildings, and cities that are not capital cities are not considered valid locations for this task. Your response must be in JSON format, structured as follows: { \"valid\": true, \"message\": \"Reason why it is a valid location\" } The \"valid\" field should be true if the input represents a valid location and false otherwise. The \"message\" field should provide a brief explanation or reason for why the input is considered valid or invalid as a location. Keep in mind the following guidelines: Valid locations include countries, continents, recognized capital cities, and significant administrative regions/states/provinces known on a global scale. Invalid locations include specific cities (unless they are recognized capital cities), landmarks, natural features (unless they are major geographic entities), and man-made structures like airports or famous buildings. Please ensure your response adheres to these guidelines and provides accurate validation for a wide range of location inputs."
                        },
                        {
                            "role": "user",
                            "content": guess
                        }

                    ],
                    temperature: 1,
                    max_tokens: 256,
                    top_p: 1,
                    frequency_penalty: 0,
                    presence_penalty: 0,
                });

                // response.then((res) => {
                //     return JSON.parse(res.choices[0].message.content);               
                // })

                const validity = JSON.parse(response.choices[0].message.content);
                console.log(validity)
                return validity

            }

            const rules = [letterCheck, validLocation]

            // Execute all validations concurrently using Promise.all
            const validations = await Promise.all(rules.map(rule => rule(guess)));

            // Could even incude a rule checker to have error messages returned too, to tell user what they did wrong
            for (let i = 0; i < validations.length; i++) {
                const validity = validations[i]
                console.log(validity)
                if (validity.valid === false) {
                    return validity
                }
            };

            return { valid: true, message: validations[validations.length - 1].message };
        }

        setWarning("verifying... " + guess)
        const validity = await validator(guess)
        console.log(validity)
        if (validity) {
            if (validity.valid == true) {
                setGuessed(guessed => [...guessed, guess])
            }
            setWarning(validity.message)
            return validity
        }

    }

    const style1 = { minHeight: '100vh', maxHeight: '100vh', display: 'flex', flexDirection: 'column' }
    return (

        <Container>
            <Row>
                <h1 style={{ color: 'white', fontSize: '500%' }}>atlas - (🌎)</h1>
            </Row>
            <Row>
                <Stack gap={3}>
                    <div className="p-2">
                        {/* container here for the words we've done */}
                        <Guessed guessed={guessed} setGuessed={setGuessed} />
                    </div>

                    {/* container to type the words */}
                    <Guesser guessed={guessed} validateAndAppend={validateAndAppend} />
                </Stack>
            </Row>
            <br></br>
            <Row>
                <Card>
                    <Card.Header>Feedback</Card.Header>
                    <Card.Body>{warning}</Card.Body>
                </Card>
            </Row>
        </Container>


    )
}

export default Atlas;