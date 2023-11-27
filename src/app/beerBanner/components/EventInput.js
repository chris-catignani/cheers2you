import { Button, Container, Input } from "@chakra-ui/react"
import { useState } from "react"

export const EventInput = ({personsName, eventName, isGenerating, onClick}) => {
    const [tempPersonsName, setTempPersonsName] = useState(personsName)
    const [tempEventName, setTempEventName] = useState(eventName)

    return (
        <Container maxW='md'>
            <Input
                placeholder='Persons Name'
                value={tempPersonsName}
                onChange={e => setTempPersonsName(e.target.value)}
            />
            <Input
                placeholder='Event Name'
                value={tempEventName}
                onChange={e => setTempEventName(e.target.value)}
            />
            <Button
                width='full'
                isLoading={isGenerating}
                onClick={() => onClick(tempPersonsName, tempEventName)}>
                Generate
            </Button>
        </Container>
    )
}
