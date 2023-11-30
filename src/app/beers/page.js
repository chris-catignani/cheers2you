'use client'

import { useRouter } from 'next/navigation';
import { Box } from "@chakra-ui/react";
import { Beers } from "./Beers";
import { useSearchParams } from "next/navigation";
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setVenue } from '@/lib/redux';

export default function Page() {
  const dispatch = useDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()
  const personsName = searchParams.get('name') || ''
  const venueName = searchParams.get('venue') || ''

  if (!personsName || !venueName) {
    router.push('/?' + searchParams)
    return (<></>)
  }

  useEffect(() => {
    dispatch(setVenue(venueName))
  }, [dispatch, venueName])

  return (
    <Box m='5'>
      <Beers personsName={personsName}/>
    </Box>
  )
}
