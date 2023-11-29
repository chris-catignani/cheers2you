'use client'

import { useRouter } from 'next/navigation';
import { Box } from "@chakra-ui/react";
import { Beers } from "./Beers";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const name = searchParams.get('name') || ''

  if (!name) {
    router.push('/')
    return (<></>)
  }

  return (
    <Box m='5'>
      <Beers personsName={name}/>
    </Box>
  )
}
