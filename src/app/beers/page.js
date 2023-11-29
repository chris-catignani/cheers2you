'use client'

import { Box } from "@chakra-ui/react";
import { Beers } from "./Beers";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams()
  const name = searchParams.get('name')

  return (
    <main>
      <Box m='5'>
        <Beers personsName={name}/>
      </Box>
    </main>
  )
}
